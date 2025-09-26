import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export type ViewAsRole = 'pro' | 'agency_admin' | 'client_viewer' | 'platform_admin';

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

export const useAppMode = (tenantId?: string, uiRoleOverride?: ViewAsRole) => {
  const { user, session } = useAuthStore();
  const [mode, setMode] = useState<AppMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMode = useCallback(async (requestedTenantId?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Construire l'URL avec le paramètre tenant si fourni
      const url = new URL('/system-mode', window.location.origin);
      if (requestedTenantId) {
        url.searchParams.set('tenant', requestedTenantId);
      }

      const { data, error: fetchError } = await supabase.functions.invoke('system-mode', {
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined,
        body: requestedTenantId ? { tenantId: requestedTenantId } : undefined
      });

      if (fetchError) {
        throw new Error(fetchError.message || 'Erreur lors de la récupération du mode');
      }

      if (!data.ok) {
        throw new Error(data.error || 'Réponse invalide du serveur');
      }

      setMode(data as AppMode);
    } catch (err: any) {
      console.error('Error fetching app mode:', err);
      setError(err.message);
      
      // Fallback vers le mode démo en cas d'erreur
      setMode({
        mode: 'DEMO',
        role: 'prospect',
        source: 'mock',
        tenant_category: 'demo',
        badges: ['🧪 Mode Démo', 'Erreur de connexion'],
        capabilities: {
          canWrite: false,
          canExport: false,
          canSync: false
        },
        allowed_pages: ['*'],
        features: {},
        traceId: crypto.randomUUID(),
        warnings: ['Impossible de déterminer le mode, basculement en démo'],
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  // Récupérer le mode au montage et quand l'utilisateur ou le tenant change
  useEffect(() => {
    fetchMode(tenantId);
  }, [fetchMode, tenantId]);

  // Rafraîchir le mode quand l'état d'authentification change
  useEffect(() => {
    if (user) {
      fetchMode(tenantId);
    } else {
      // Mode démo pour les utilisateurs non connectés
      setMode({
        mode: 'DEMO',
        role: 'prospect',
        source: 'mock',
        tenant_category: 'demo',
        badges: ['🧪 Mode Démo', 'Connectez-vous pour accéder à vos données'],
        capabilities: {
          canWrite: false,
          canExport: false,
          canSync: false
        },
        allowed_pages: ['*'],
        features: {},
        traceId: crypto.randomUUID(),
        warnings: ['Connectez-vous pour accéder à toutes les fonctionnalités']
      });
      setLoading(false);
    }
  }, [user, fetchMode, tenantId]);

  const refreshMode = useCallback((requestedTenantId?: string) => {
    fetchMode(requestedTenantId || tenantId);
  }, [fetchMode, tenantId]);

  // Rôle effectif (serveur ou UI override)
  const effectiveRole = uiRoleOverride || mode?.role || 'prospect';
  const realRole = mode?.role || 'prospect'; // Toujours le vrai rôle serveur
  
  // Helpers pour vérifier les capacités (désactivées si UI override actif)
  const isUiOverrideActive = !!uiRoleOverride && uiRoleOverride !== 'platform_admin';
  const canWrite = isUiOverrideActive ? false : (mode?.capabilities.canWrite ?? false);
  const canExport = isUiOverrideActive ? false : (mode?.capabilities.canExport ?? false);
  const canSync = isUiOverrideActive ? false : (mode?.capabilities.canSync ?? false);
  const isDemo = mode?.mode === 'DEMO';
  const isOnboarding = mode?.mode === 'ONBOARDING';
  const isProduction = mode?.mode === 'PRODUCTION';
  
  // Helpers pour les rôles (basés sur le rôle effectif pour l'UI)
  const isProspect = effectiveRole === 'prospect';
  const isPro = effectiveRole === 'pro';
  const isAgencyAdmin = effectiveRole === 'agency_admin';
  const isClientViewer = effectiveRole === 'client_viewer';
  const isTenantAdmin = effectiveRole === 'tenant_admin';
  const isPlatformAdmin = effectiveRole === 'platform_admin';
  
  // Helper pour le vrai rôle (toujours serveur, jamais override)
  const isRealPlatformAdmin = realRole === 'platform_admin';
  
  // Helper pour vérifier l'accès aux pages
  const hasPageAccess = useCallback((page: string) => {
    if (!mode?.allowed_pages) return false;
    return mode.allowed_pages.includes('*') || mode.allowed_pages.includes(page);
  }, [mode?.allowed_pages]);
  
  // Helper pour vérifier les features
  const hasFeature = useCallback((feature: string) => {
    return mode?.features?.[feature] ?? false;
  }, [mode?.features]);

  return {
    mode,
    loading,
    error,
    refreshMode,
    // Helpers
    canWrite,
    canExport,
    canSync,
    // Helpers de mode
    isDemo,
    isOnboarding,
    isProduction,
    // Helpers de rôle (UI effectif)
    isProspect,
    isPro,
    isAgencyAdmin,
    isClientViewer,
    isTenantAdmin,
    isPlatformAdmin,
    // Helpers pour le vrai rôle serveur
    isRealPlatformAdmin,
    // Helpers d'accès
    hasPageAccess,
    hasFeature,
    // État UI override
    isUiOverrideActive,
    uiRoleOverride,
    effectiveRole,
    realRole,
    // Informations détaillées
    badges: mode?.badges ?? [],
    warnings: mode?.warnings ?? [],
    traceId: mode?.traceId,
    tenantId: mode?.tenant_id,
    tenantCategory: mode?.tenant_category,
    parentTenantId: mode?.parent_tenant_id,
    shopifyConnected: mode?.shopify_connected ?? false,
    source: mode?.source ?? 'mock',
    role: effectiveRole, // Rôle affiché dans l'UI
    allowedPages: mode?.allowed_pages ?? [],
    features: mode?.features ?? {}
  };
};