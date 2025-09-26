export interface TenantContext {
  tenantId: string
  role: 'prospect' | 'pro' | 'agency_admin' | 'client_viewer' | 'tenant_admin' | 'platform_admin'
  tenantCategory: 'demo' | 'customer' | 'agency'
  parentTenantId?: string | null
  canSwitchContext: boolean
  availableTenants?: TenantOption[]
}

export interface TenantOption {
  id: string
  label: string
  type: 'agency' | 'customer'
  category: 'demo' | 'customer' | 'agency'
  shopifyConnected?: boolean
  parentTenantId?: string | null
}

export class ContextError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = 'ContextError'
  }
}

/**
 * Résout et valide le contexte tenant pour un utilisateur
 * Source de vérité côté serveur pour la sécurité
 */
export async function resolveContext(
  supabase: any, 
  userId: string, 
  requestedTenantId?: string
): Promise<TenantContext> {
  
  // 1) Récupérer tous les tenants où l'utilisateur est membre
  const { data: memberships, error: membershipError } = await supabase
    .from('tenants_users')
    .select(`
      tenant_id,
      role,
      tenants!inner (
        id,
        name,
        category,
        parent_tenant_id,
        shopify_connected
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')

  if (membershipError) {
    throw new ContextError('MEMBERSHIP_ERROR', `Failed to fetch memberships: ${membershipError.message}`)
  }

  if (!memberships?.length) {
    throw new ContextError('NO_TENANT', 'User has no active tenant memberships')
  }

  // 2) Construire le scope des tenants accessibles
  const myTenants = new Set(memberships.map(m => m.tenant_id))
  const isAgencyAdmin = memberships.some(m => m.role === 'agency_admin')
  const isPlatformAdmin = memberships.some(m => m.role === 'platform_admin')

  // Si agency_admin, ajouter les tenants enfants
  if (isAgencyAdmin) {
    const agencyTenantIds = memberships
      .filter(m => m.role === 'agency_admin')
      .map(m => m.tenant_id)

    for (const agencyId of agencyTenantIds) {
      const { data: children } = await supabase
        .from('tenants')
        .select('id')
        .eq('parent_tenant_id', agencyId)
        .eq('status', 'active')

      children?.forEach((child: { id: string }) => myTenants.add(child.id))
    }
  }

  // Si platform_admin, accès à tous les tenants (pour routes admin)
  if (isPlatformAdmin && requestedTenantId) {
    const { data: requestedTenant } = await supabase
      .from('tenants')
      .select('id, name, category, parent_tenant_id')
      .eq('id', requestedTenantId)
      .single()

    if (requestedTenant) {
      myTenants.add(requestedTenantId)
    }
  }

  // 3) Déterminer le tenant cible
  const wantedTenantId = requestedTenantId ?? memberships[0].tenant_id

  if (!myTenants.has(wantedTenantId)) {
    throw new ContextError('TENANT_OUT_OF_SCOPE', `Tenant ${wantedTenantId} is not accessible for user ${userId}`)
  }

  // 4) Récupérer les détails du tenant cible
  const targetMembership = memberships.find(m => m.tenant_id === wantedTenantId)
  const targetTenant = targetMembership?.tenants

  if (!targetTenant) {
    throw new ContextError('TENANT_NOT_FOUND', `Tenant ${wantedTenantId} not found`)
  }

  // 5) Déterminer le rôle effectif
  let effectiveRole = targetMembership.role

  // Si agency_admin accède à un client, le rôle devient 'tenant_admin' dans ce contexte
  if (isAgencyAdmin && targetTenant.parent_tenant_id && targetMembership.role === 'agency_admin') {
    effectiveRole = 'tenant_admin'
  }

  // 6) Construire la liste des tenants disponibles pour le switcher
  const availableTenants: TenantOption[] = []

  if (isAgencyAdmin || isPlatformAdmin) {
    // Ajouter les agences où l'utilisateur est admin
    const agencyMemberships = memberships.filter(m => 
      m.role === 'agency_admin' && m.tenants.category === 'agency'
    )
    
    for (const membership of agencyMemberships) {
      availableTenants.push({
        id: membership.tenant_id,
        label: membership.tenants.name,
        type: 'agency',
        category: membership.tenants.category,
        shopifyConnected: membership.tenants.shopify_connected
      })

      // Ajouter les clients de cette agence
      const { data: clients } = await supabase
        .from('tenants')
        .select('id, name, category, shopify_connected, parent_tenant_id')
        .eq('parent_tenant_id', membership.tenant_id)
        .eq('status', 'active')

      clients?.forEach(client => {
        availableTenants.push({
          id: client.id,
          label: client.name,
          type: 'customer',
          category: client.category,
          shopifyConnected: client.shopify_connected,
          parentTenantId: client.parent_tenant_id
        })
      })
    }
  }

  return {
    tenantId: wantedTenantId,
    role: effectiveRole,
    tenantCategory: targetTenant.category,
    parentTenantId: targetTenant.parent_tenant_id,
    canSwitchContext: isAgencyAdmin || isPlatformAdmin,
    availableTenants: availableTenants.length > 0 ? availableTenants : undefined
  }
}

/**
 * Récupère les options de tenants disponibles pour le switcher
 */
export async function getTenantOptions(
  supabase: any, 
  userId: string
): Promise<TenantOption[]> {
  const context = await resolveContext(supabase, userId)
  return context.availableTenants || []
}

/**
 * Valide qu'un utilisateur peut accéder à un tenant spécifique
 */
export async function validateTenantAccess(
  supabase: any, 
  userId: string, 
  tenantId: string
): Promise<boolean> {
  try {
    await resolveContext(supabase, userId, tenantId)
    return true
  } catch (error) {
    if (error instanceof ContextError) {
      return false
    }
    throw error
  }
}