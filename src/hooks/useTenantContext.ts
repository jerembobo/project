import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export type TenantOption = {
  id: string
  label: string
  type: 'agency' | 'customer'
  category: 'demo' | 'customer' | 'agency'
  shopifyConnected?: boolean
  parentTenantId?: string | null
}

export type TenantContext = {
  tenantId: string
  role: 'prospect' | 'pro' | 'agency_admin' | 'client_viewer' | 'tenant_admin' | 'platform_admin'
  tenantCategory: 'demo' | 'customer' | 'agency'
  parentTenantId?: string | null
  canSwitchContext: boolean
  availableTenants?: TenantOption[]
}

interface UseTenantContextReturn {
  // État actuel
  currentTenantId: string | null
  tenantOptions: TenantOption[]
  context: TenantContext | null
  isLoading: boolean
  error: string | null

  // Actions
  switchTenant: (tenantId: string) => Promise<void>
  refreshOptions: () => Promise<void>
  validateCurrentContext: () => Promise<boolean>
}

export function useTenantContext(): UseTenantContextReturn {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null)
  const [tenantOptions, setTenantOptions] = useState<TenantOption[]>([])
  const [context, setContext] = useState<TenantContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extraire le tenantId de l'URL ou du localStorage
  const getTenantFromUrl = useCallback(() => {
    const urlParams = new URLSearchParams(location.search)
    const urlTenant = urlParams.get('tenant')
    const storedTenant = localStorage.getItem('currentTenantId')
    return urlTenant || storedTenant
  }, [location.search])

  // Persister le tenant dans l'URL et localStorage
  const persistTenant = useCallback((tenantId: string) => {
    localStorage.setItem('currentTenantId', tenantId)
    
    const urlParams = new URLSearchParams(location.search)
    urlParams.set('tenant', tenantId)
    
    const newUrl = `${location.pathname}?${urlParams.toString()}`
    navigate(newUrl, { replace: true })
  }, [location.pathname, location.search, navigate])

  // Charger les options de tenants disponibles
  const loadTenantOptions = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('system-mode/tenant-options')
      
      if (error) throw error
      
      if (data?.ok && data?.options) {
        setTenantOptions(data.options)
        return data.options
      } else {
        throw new Error(data?.error || 'Failed to load tenant options')
      }
    } catch (err) {
      console.error('Error loading tenant options:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tenant options')
      return []
    }
  }, [])

  // Résoudre le contexte pour un tenant spécifique
  const resolveContext = useCallback(async (tenantId: string): Promise<TenantContext | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('system-mode/resolve-context', {
        body: { tenantId }
      })
      
      if (error) throw error
      
      if (data?.ok && data?.context) {
        return data.context
      } else {
        throw new Error(data?.error || 'Failed to resolve context')
      }
    } catch (err) {
      console.error('Error resolving context:', err)
      setError(err instanceof Error ? err.message : 'Failed to resolve context')
      return null
    }
  }, [])

  // Changer de tenant avec validation serveur
  const switchTenant = useCallback(async (tenantId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // 1. Valider l'accès au tenant
      const { data: validationData, error: validationError } = await supabase.functions.invoke('system-mode/validate-tenant', {
        body: { tenantId }
      })
      
      if (validationError) throw validationError
      
      if (!validationData?.ok || !validationData?.valid) {
        throw new Error('Accès refusé à ce tenant')
      }

      // 2. Résoudre le contexte
      const newContext = await resolveContext(tenantId)
      if (!newContext) {
        throw new Error('Impossible de résoudre le contexte')
      }

      // 3. Mettre à jour l'état
      setCurrentTenantId(tenantId)
      setContext(newContext)
      persistTenant(tenantId)
      
    } catch (err) {
      console.error('Error switching tenant:', err)
      setError(err instanceof Error ? err.message : 'Failed to switch tenant')
    } finally {
      setIsLoading(false)
    }
  }, [resolveContext, persistTenant])

  // Valider le contexte actuel
  const validateCurrentContext = useCallback(async (): Promise<boolean> => {
    if (!currentTenantId) return false
    
    try {
      const { data, error } = await supabase.functions.invoke('system-mode/validate-tenant', {
        body: { tenantId: currentTenantId }
      })
      
      if (error) throw error
      
      return data?.ok && data?.valid
    } catch (err) {
      console.error('Error validating context:', err)
      return false
    }
  }, [currentTenantId])

  // Rafraîchir les options
  const refreshOptions = useCallback(async () => {
    setIsLoading(true)
    await loadTenantOptions()
    setIsLoading(false)
  }, [loadTenantOptions])

  // Initialisation
  useEffect(() => {
    const initializeContext = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // 1. Charger les options disponibles
        const options = await loadTenantOptions()
        
        // 2. Déterminer le tenant initial
        const urlTenant = getTenantFromUrl()
        let initialTenantId = urlTenant
        
        // Si pas de tenant dans l'URL/localStorage, prendre le premier disponible
        if (!initialTenantId && options.length > 0) {
          initialTenantId = options[0].id
        }
        
        // 3. Résoudre le contexte initial
        if (initialTenantId) {
          const initialContext = await resolveContext(initialTenantId)
          if (initialContext) {
            setCurrentTenantId(initialTenantId)
            setContext(initialContext)
            persistTenant(initialTenantId)
          }
        }
        
      } catch (err) {
        console.error('Error initializing context:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize context')
      } finally {
        setIsLoading(false)
      }
    }

    initializeContext()
  }, []) // Seulement au montage

  // Écouter les changements d'URL pour synchroniser le tenant
  useEffect(() => {
    const urlTenant = getTenantFromUrl()
    if (urlTenant && urlTenant !== currentTenantId) {
      switchTenant(urlTenant)
    }
  }, [location.search, currentTenantId, switchTenant, getTenantFromUrl])

  return {
    currentTenantId,
    tenantOptions,
    context,
    isLoading,
    error,
    switchTenant,
    refreshOptions,
    validateCurrentContext
  }
}