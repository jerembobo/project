import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppMode } from './useAppMode';
import { useTenantContext } from './useTenantContext';
import { useAuth } from './useAuth';
import { viewAsTelemetry } from '../lib/telemetry';

export type ViewAsRole = 'pro' | 'agency_admin' | 'client_viewer' | 'platform_admin';

interface ViewAsState {
  isActive: boolean;
  uiRole: ViewAsRole;
  uiTenantId?: string;
  reason?: string;
  startedAt?: Date;
}

interface ViewAsTelemetry {
  who: string;
  uiRole: ViewAsRole;
  tenantUI?: string;
  startedAt: Date;
  endedAt?: Date;
  reason?: string;
}

interface UseViewAsReturn {
  // État actuel
  isViewAsActive: boolean;
  currentUiRole: ViewAsRole;
  uiTenantId?: string;
  isFeatureEnabled: boolean;
  
  // Actions
  startViewAs: (role: ViewAsRole, tenantId?: string, reason?: string) => void;
  stopViewAs: () => void;
  
  // Helpers pour l'UI
  canUseViewAs: boolean;
  getEffectiveRole: () => ViewAsRole;
  isWriteDisabled: boolean;
  
  // Telemetry
  getCurrentSession: () => ViewAsTelemetry | null;
}

const STORAGE_KEY = 'viewas_state';
const FEATURE_FLAG_KEY = 'VITE_FEATURE_VIEW_AS';

export function useViewAs(): UseViewAsReturn {
  const queryClient = useQueryClient();
  const { isPlatformAdmin, role: realRole } = useAppMode();
  const { currentTenantId, tenantOptions } = useTenantContext();
  const { user, profile } = useAuth();
  
  // Feature flag check
  const isFeatureEnabled = import.meta.env[FEATURE_FLAG_KEY] === 'true';
  
  // État local
  const [viewAsState, setViewAsState] = useState<ViewAsState>(() => {
    // Récupérer l'état depuis localStorage au démarrage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          startedAt: parsed.startedAt ? new Date(parsed.startedAt) : undefined
        };
      }
    } catch (error) {
      console.warn('Failed to parse ViewAs state from localStorage:', error);
    }
    
    return {
      isActive: false,
      uiRole: 'platform_admin',
      uiTenantId: undefined,
      reason: undefined,
      startedAt: undefined
    };
  });

  // Persister l'état dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewAsState));
    } catch (error) {
      console.warn('Failed to save ViewAs state to localStorage:', error);
    }
  }, [viewAsState]);

  // Nettoyage si feature désactivée ou plus admin
  useEffect(() => {
    if (!isFeatureEnabled || !isPlatformAdmin) {
      if (viewAsState.isActive) {
        stopViewAs();
      }
    }
  }, [isFeatureEnabled, isPlatformAdmin]);

  // Fonction pour invalider les caches avec la nouvelle clé
  const invalidateCaches = useCallback((newUiRole: ViewAsRole) => {
    // Invalider tous les caches qui dépendent du rôle
    queryClient.invalidateQueries({
      predicate: (query) => {
        // Invalider les queries qui contiennent des données sensibles au rôle
        const sensitiveKeys = [
          'campaigns',
          'products', 
          'clients',
          'system-mode',
          'recommendations',
          'analytics'
        ];
        
        return sensitiveKeys.some(key => 
          query.queryKey.some(k => 
            typeof k === 'string' && k.includes(key)
          )
        );
      }
    });

    // Log pour debug
    console.log(`[ViewAs] Caches invalidated for role switch to: ${newUiRole}`);
  }, [queryClient]);

  // Telemetry logging
  const logTelemetry = useCallback((telemetry: ViewAsTelemetry) => {
    // Log en console pour debug
    console.log('[ViewAs Telemetry]', telemetry);
    
    // TODO: Envoyer à un service de telemetry si nécessaire
    // analytics.track('view_as_session', telemetry);
  }, []);

  const startViewAs = useCallback((role: ViewAsRole, tenantId?: string, reason?: string) => {
    if (!isFeatureEnabled || !isPlatformAdmin) {
      console.warn('[ViewAs] Feature disabled or insufficient permissions');
      return;
    }

    const startedAt = new Date();
    const selectedTenant = tenantOptions?.find(t => t.id === tenantId);
    
    setViewAsState({
      isActive: true,
      uiRole: role,
      uiTenantId: tenantId,
      reason,
      startedAt
    });

    // Invalider les caches avec le nouveau rôle
    invalidateCaches(role);

    // Télémétrie moderne
    viewAsTelemetry.trackStart({
      userId: user?.id || 'unknown',
      userEmail: profile?.email || user?.email,
      realRole: realRole || 'unknown',
      uiRole: role,
      tenantId,
      tenantName: selectedTenant?.label,
      reason
    });

    // Log telemetry (ancien système)
    logTelemetry({
      who: profile?.email || user?.email || 'platform_admin',
      uiRole: role,
      tenantUI: tenantId,
      startedAt,
      reason
    });

    console.log(`[ViewAs] Started viewing as ${role}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
  }, [isFeatureEnabled, isPlatformAdmin, invalidateCaches, logTelemetry, user, profile, realRole, tenantOptions]);

  const stopViewAs = useCallback(() => {
    if (!viewAsState.isActive) return;

    const endedAt = new Date();
    const selectedTenant = tenantOptions?.find(t => t.id === viewAsState.uiTenantId);
    const duration = viewAsState.startedAt ? endedAt.getTime() - viewAsState.startedAt.getTime() : undefined;
    
    // Télémétrie moderne
    viewAsTelemetry.trackStop({
      userId: user?.id || 'unknown',
      userEmail: profile?.email || user?.email,
      realRole: realRole || 'unknown',
      uiRole: viewAsState.uiRole,
      tenantId: viewAsState.uiTenantId,
      tenantName: selectedTenant?.label,
      reason: viewAsState.reason,
      duration
    });

    // Log telemetry de fin (ancien système)
    if (viewAsState.startedAt) {
      logTelemetry({
        who: profile?.email || user?.email || 'platform_admin',
        uiRole: viewAsState.uiRole,
        tenantUI: viewAsState.uiTenantId,
        startedAt: viewAsState.startedAt,
        endedAt,
        reason: viewAsState.reason
      });
    }

    // Reset state
    setViewAsState({
      isActive: false,
      uiRole: 'platform_admin',
      uiTenantId: undefined,
      reason: undefined,
      startedAt: undefined
    });

    // Invalider les caches pour revenir au mode normal
    invalidateCaches('platform_admin');

    console.log('[ViewAs] Stopped viewing as, returned to platform_admin');
  }, [viewAsState, invalidateCaches, logTelemetry, user, profile, realRole, tenantOptions]);

  const getEffectiveRole = useCallback((): ViewAsRole => {
    if (!isFeatureEnabled || !isPlatformAdmin || !viewAsState.isActive) {
      return realRole as ViewAsRole || 'platform_admin';
    }
    return viewAsState.uiRole;
  }, [isFeatureEnabled, isPlatformAdmin, viewAsState.isActive, viewAsState.uiRole, realRole]);

  const getCurrentSession = useCallback((): ViewAsTelemetry | null => {
    if (!viewAsState.isActive || !viewAsState.startedAt) return null;
    
    return {
      who: 'platform_admin',
      uiRole: viewAsState.uiRole,
      tenantUI: viewAsState.uiTenantId,
      startedAt: viewAsState.startedAt,
      reason: viewAsState.reason
    };
  }, [viewAsState]);

  return {
    // État
    isViewAsActive: viewAsState.isActive && isFeatureEnabled && isPlatformAdmin,
    currentUiRole: getEffectiveRole(),
    uiTenantId: viewAsState.uiTenantId,
    isFeatureEnabled,
    
    // Actions
    startViewAs,
    stopViewAs,
    
    // Helpers
    canUseViewAs: isFeatureEnabled && isPlatformAdmin,
    getEffectiveRole,
    isWriteDisabled: viewAsState.isActive && viewAsState.uiRole !== 'platform_admin',
    
    // Telemetry
    getCurrentSession
  };
}