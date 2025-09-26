/**
 * Service de télémétrie pour tracer les actions View As
 * Permet l'audit et le monitoring des sessions d'impersonation
 */

export interface ViewAsTelemetryEvent {
  event: 'view_as_start' | 'view_as_stop' | 'view_as_action';
  timestamp: Date;
  userId: string;
  userEmail?: string;
  realRole: string;
  uiRole: string;
  tenantId?: string;
  tenantName?: string;
  reason?: string;
  action?: string; // Pour les actions spécifiques en mode View As
  metadata?: Record<string, any>;
}

export interface TelemetryConfig {
  enabled: boolean;
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
}

class TelemetryService {
  private config: TelemetryConfig;
  private eventQueue: ViewAsTelemetryEvent[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: TelemetryConfig = { enabled: false }) {
    this.config = {
      batchSize: 10,
      flushInterval: 30000, // 30 secondes
      ...config
    };

    if (this.config.enabled && this.config.flushInterval) {
      this.startFlushTimer();
    }
  }

  /**
   * Enregistre un événement de télémétrie
   */
  track(event: Omit<ViewAsTelemetryEvent, 'timestamp'>): void {
    if (!this.config.enabled) {
      // En mode développement, log en console
      console.log('[ViewAs Telemetry]', {
        ...event,
        timestamp: new Date()
      });
      return;
    }

    const telemetryEvent: ViewAsTelemetryEvent = {
      ...event,
      timestamp: new Date()
    };

    this.eventQueue.push(telemetryEvent);

    // Flush si la queue est pleine
    if (this.eventQueue.length >= (this.config.batchSize || 10)) {
      this.flush();
    }
  }

  /**
   * Envoie tous les événements en attente
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      if (this.config.endpoint) {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events })
        });
      } else {
        // Fallback: log en console
        console.log('[ViewAs Telemetry Batch]', events);
      }
    } catch (error) {
      console.error('[ViewAs Telemetry] Failed to send events:', error);
      // Remettre les événements dans la queue en cas d'erreur
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Démarre le timer de flush automatique
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Arrête le service et flush les événements restants
   */
  async stop(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
    await this.flush();
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig: Partial<TelemetryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enabled && this.config.flushInterval) {
      this.startFlushTimer();
    } else if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }
}

// Instance singleton
const telemetryConfig: TelemetryConfig = {
  enabled: import.meta.env.VITE_TELEMETRY_ENABLED === 'true',
  endpoint: import.meta.env.VITE_TELEMETRY_ENDPOINT,
  batchSize: parseInt(import.meta.env.VITE_TELEMETRY_BATCH_SIZE || '10'),
  flushInterval: parseInt(import.meta.env.VITE_TELEMETRY_FLUSH_INTERVAL || '30000')
};

export const telemetry = new TelemetryService(telemetryConfig);

// Cleanup au déchargement de la page
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    telemetry.stop();
  });
}

/**
 * Helpers pour les événements View As courants
 */
export const viewAsTelemetry = {
  /**
   * Trace le début d'une session View As
   */
  trackStart(params: {
    userId: string;
    userEmail?: string;
    realRole: string;
    uiRole: string;
    tenantId?: string;
    tenantName?: string;
    reason?: string;
  }): void {
    telemetry.track({
      event: 'view_as_start',
      ...params
    });
  },

  /**
   * Trace la fin d'une session View As
   */
  trackStop(params: {
    userId: string;
    userEmail?: string;
    realRole: string;
    uiRole: string;
    tenantId?: string;
    tenantName?: string;
    reason?: string;
    duration?: number;
  }): void {
    telemetry.track({
      event: 'view_as_stop',
      ...params
    });
  },

  /**
   * Trace une action spécifique en mode View As
   */
  trackAction(params: {
    userId: string;
    userEmail?: string;
    realRole: string;
    uiRole: string;
    tenantId?: string;
    tenantName?: string;
    action: string;
    metadata?: Record<string, any>;
  }): void {
    telemetry.track({
      event: 'view_as_action',
      ...params
    });
  }
};