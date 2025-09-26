/**
 * Correction temporaire pour le mode Demo
 * Cette fonction corrige les pages autorisées pour les utilisateurs en mode Demo
 */

export interface AppMode {
  mode: 'DEMO' | 'ONBOARDING' | 'PRODUCTION';
  role: 'prospect' | 'pro' | 'agency_admin' | 'client_viewer' | 'tenant_admin' | 'platform_admin';
  source: 'mock' | 'shopify_admin' | 'database';
  tenant_id?: string;
  tenant_category?: 'demo' | 'customer' | 'agency';
  parent_tenant_id?: string | null;
  shopify_connected?: boolean;
  badges: string[];
  capabilities: {
    canWrite: boolean;
    canExport: boolean;
    canSync: boolean;
  };
  allowed_pages: string[];
  features: Record<string, any>;
  traceId: string;
  warnings?: string[];
  error?: string;
}

/**
 * Applique une correction temporaire pour le mode Demo
 * En attendant la correction de la base de données
 */
export function applyDemoModeFix(appMode: AppMode): AppMode {
  // Si c'est le mode Demo et que les pages sont limitées, on les étend
  if (appMode.mode === 'DEMO' && appMode.allowed_pages.length <= 1) {
    console.log('🔧 Application de la correction temporaire pour le mode Demo');
    
    return {
      ...appMode,
      allowed_pages: ['*'] // Autoriser toutes les pages en mode Demo
    };
  }
  
  return appMode;
}

/**
 * Vérifie si une page est autorisée pour l'utilisateur
 */
export function isPageAllowed(pageName: string, allowedPages: string[]): boolean {
  // Si "*" est dans les pages autorisées, tout est autorisé
  if (allowedPages.includes('*')) {
    return true;
  }
  
  // Sinon, vérifier si la page spécifique est autorisée
  return allowedPages.includes(pageName);
}