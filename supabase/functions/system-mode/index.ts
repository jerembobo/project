/// <reference types="https://deno.land/x/types/index.d.ts" />
/// <reference lib="deno.window" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { resolveContext, getTenantOptions, validateTenantAccess, ContextError, type TenantContext } from './resolveContext.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface ExtendedModeResponse {
  ok: boolean
  mode: 'DEMO' | 'ONBOARDING' | 'PRODUCTION'
  role: 'prospect' | 'pro' | 'agency_admin' | 'client_viewer' | 'tenant_admin' | 'platform_admin'
  source: 'mock' | 'shopify_admin' | 'database'
  tenant_id?: string
  tenant_category?: 'demo' | 'customer' | 'agency'
  parent_tenant_id?: string | null
  shopify_connected?: boolean
  badges: string[]
  capabilities: {
    canWrite: boolean
    canExport: boolean
    canSync: boolean
  }
  allowed_pages: string[]
  features: Record<string, any>
  traceId: string
  warnings?: string[]
  error?: string
}

// Middleware pour calculer le mode utilisateur étendu
async function computeUserModeExtended(supabaseClient: any, userId: string): Promise<ExtendedModeResponse> {
  const traceId = crypto.randomUUID()
  
  try {
    // Appeler la fonction SQL pour obtenir le mode étendu
    const { data: modeData, error: modeError } = await supabaseClient
      .rpc('get_user_mode_extended', { user_uuid: userId })
    
    if (modeError) {
      console.error('Error getting user mode:', modeError)
      // Fallback vers DEMO en cas d'erreur
      return {
        ok: true,
        mode: 'DEMO',
        role: 'prospect',
        source: 'mock',
        tenant_category: 'demo',
        badges: ['🧪 Mode Démo', 'Données simulées', 'Accès limité'],
        capabilities: {
          canWrite: false,
          canExport: false,
          canSync: false
        },
        allowed_pages: ['*'],
        features: {},
        traceId,
        warnings: ['Erreur lors de la détection du mode, basculement en démo']
      }
    }
    
    const modeInfo = modeData as any
    const mode = modeInfo.mode as 'DEMO' | 'ONBOARDING' | 'PRODUCTION'
    const role = modeInfo.role as 'prospect' | 'pro' | 'agency_admin' | 'client_viewer' | 'tenant_admin' | 'platform_admin'
    
    // Construire les badges selon le mode et le rôle
    let badges: string[] = []
    
    switch (mode) {
      case 'DEMO':
        badges = ['🧪 Mode Démo', 'Données simulées']
        if (role === 'prospect') {
          badges.push('Accès limité')
        }
        break
      
      case 'ONBOARDING':
        badges = ['⚙️ Configuration', 'Connectez votre boutique']
        if (role === 'agency_admin') {
          badges.push('Gestion multi-clients')
        }
        break
      
      case 'PRODUCTION':
        badges = ['✅ Connecté', 'Données temps réel']
        if (role === 'agency_admin') {
          badges.push('Vue agence')
        } else if (role === 'client_viewer') {
          badges.push('Vue client')
        } else if (role === 'platform_admin') {
          badges.push('Admin plateforme')
        }
        break
    }
    
    return {
      ok: true,
      mode,
      role,
      source: modeInfo.source || 'mock',
      tenant_id: modeInfo.tenant_id,
      tenant_category: modeInfo.tenant_category,
      parent_tenant_id: modeInfo.parent_tenant_id,
      shopify_connected: mode === 'PRODUCTION',
      badges,
      capabilities: modeInfo.capabilities || {
        canWrite: false,
        canExport: false,
        canSync: false
      },
      allowed_pages: modeInfo.allowed_pages || [],
      features: modeInfo.features || {},
      traceId,
      warnings: mode === 'DEMO' ? ['Les données affichées sont simulées'] : undefined
    }
    
  } catch (error) {
    console.error('Error in computeUserMode:', error)
    return {
      ok: false,
      mode: 'DEMO',
      role: 'prospect',
      source: 'mock',
      tenant_category: 'demo',
      badges: ['❌ Erreur', 'Mode démo par défaut', 'Contactez le support'],
      capabilities: {
        canWrite: false,
        canExport: false,
        canSync: false
      },
      allowed_pages: ['*'],
      features: {},
      traceId,
      error: error.message || 'Erreur interne'
    }
  }
}

// Middleware de protection en écriture pour le mode DEMO
export function withModeProtection(handler: Function) {
  return async (req: Request) => {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Récupérer l'utilisateur depuis le token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Token d\'authentification requis',
          mode: 'DEMO',
          role: 'prospect'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Token invalide',
          mode: 'DEMO',
          role: 'prospect'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Calculer le mode utilisateur
    const modeInfo = await computeUserModeExtended(supabaseClient, user.id)
    
    // Bloquer les écritures en mode DEMO
    if (modeInfo.mode === 'DEMO' && req.method !== 'GET') {
      return new Response(
        JSON.stringify({
          ok: false,
          code: 'DEMO_READ_ONLY',
          mode: modeInfo.mode,
          role: modeInfo.role,
          error: 'Les modifications ne sont pas autorisées en mode démo',
          badges: modeInfo.badges,
          traceId: modeInfo.traceId
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Ajouter les informations de mode au contexte
    const context = {
      user,
      mode: modeInfo,
      supabaseClient
    }
    
    // Appeler le handler avec le contexte
    const response = await handler(req, context)
    
    // Ajouter les headers de mode à la réponse
    if (response instanceof Response) {
      response.headers.set('X-App-Mode', modeInfo.mode)
      response.headers.set('X-App-Role', modeInfo.role)
      response.headers.set('X-Trace-Id', modeInfo.traceId)
      if (modeInfo.tenant_id) {
        response.headers.set('X-Tenant-Id', modeInfo.tenant_id)
      }
    }
    
    return response
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathname = url.pathname
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer l'utilisateur depuis le token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      // Mode démo par défaut pour les utilisateurs non connectés
      return new Response(
        JSON.stringify({
          ok: true,
          mode: 'DEMO',
          role: 'prospect',
          source: 'mock',
          tenant_category: 'demo',
          badges: ['🧪 Mode Démo', 'Connectez-vous pour accéder à vos données', 'Accès limité'],
          capabilities: {
            canWrite: false,
            canExport: false,
            canSync: false
          },
          allowed_pages: ['*'],
          features: {},
          traceId: crypto.randomUUID(),
          warnings: ['Connectez-vous pour accéder à toutes les fonctionnalités']
        } as ExtendedModeResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          ok: false,
          mode: 'DEMO',
          role: 'prospect',
          source: 'mock',
          tenant_category: 'demo',
          error: 'Token d\'authentification invalide',
          badges: ['❌ Erreur d\'authentification', 'Reconnectez-vous'],
          capabilities: {
            canWrite: false,
            canExport: false,
            canSync: false
          },
          allowed_pages: ['dashboard'],
          features: {},
          traceId: crypto.randomUUID()
        } as ExtendedModeResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Router vers les différents endpoints
    if (pathname === '/tenant-options') {
      // GET /tenant-options - Récupérer les options de tenants disponibles
      try {
        const options = await getTenantOptions(supabaseClient, user.id)
        return new Response(
          JSON.stringify({ ok: true, options }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } catch (error) {
        if (error instanceof ContextError) {
          return new Response(
            JSON.stringify({ ok: false, error: error.message, code: error.code }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: error.code === 'NO_TENANT' ? 404 : 403,
            }
          )
        }
        throw error
      }
    }

    if (pathname === '/resolve-context') {
      // POST /resolve-context - Résoudre et valider un contexte tenant
      if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: corsHeaders })
      }

      try {
        const body = await req.json()
        const { tenantId } = body
        
        const context = await resolveContext(supabaseClient, user.id, tenantId)
        return new Response(
          JSON.stringify({ ok: true, context }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } catch (error) {
        if (error instanceof ContextError) {
          return new Response(
            JSON.stringify({ ok: false, error: error.message, code: error.code }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: error.code === 'TENANT_OUT_OF_SCOPE' ? 403 : 400,
            }
          )
        }
        throw error
      }
    }

    if (pathname === '/validate-tenant') {
      // POST /validate-tenant - Valider l'accès à un tenant
      if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: corsHeaders })
      }

      try {
        const body = await req.json()
        const { tenantId } = body
        
        const isValid = await validateTenantAccess(supabaseClient, user.id, tenantId)
        return new Response(
          JSON.stringify({ ok: true, valid: isValid }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } catch (error) {
        return new Response(
          JSON.stringify({ ok: false, error: error.message }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }
    }

    // Endpoint par défaut - Calculer et retourner le mode utilisateur
    // Supporte maintenant le paramètre ?tenant=<tenantId> pour le contexte
    const requestedTenantId = url.searchParams.get('tenant')
    let modeInfo: ExtendedModeResponse
    
    if (requestedTenantId) {
      // Mode avec contexte spécifique
      try {
        const context = await resolveContext(supabaseClient, user.id, requestedTenantId)
        modeInfo = await computeUserModeExtended(supabaseClient, user.id)
        
        // Enrichir avec les informations de contexte
        modeInfo.tenant_id = context.tenantId
        modeInfo.tenant_category = context.tenantCategory
        modeInfo.parent_tenant_id = context.parentTenantId
        modeInfo.role = context.role
        
      } catch (error) {
        if (error instanceof ContextError) {
          return new Response(
            JSON.stringify({
              ok: false,
              mode: 'DEMO',
              role: 'prospect',
              source: 'mock',
              tenant_category: 'demo',
              error: `Contexte invalide: ${error.message}`,
              badges: ['❌ Contexte invalide', 'Accès refusé'],
              capabilities: { canWrite: false, canExport: false, canSync: false },
              allowed_pages: ['dashboard'],
              features: {},
              traceId: crypto.randomUUID()
            } as ExtendedModeResponse),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 403,
            }
          )
        }
        throw error
      }
    } else {
      // Mode par défaut
      modeInfo = await computeUserModeExtended(supabaseClient, user.id)
    }
    
    return new Response(
      JSON.stringify(modeInfo),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-App-Mode': modeInfo.mode,
          'X-App-Role': modeInfo.role,
          'X-Trace-Id': modeInfo.traceId
        },
        status: modeInfo.ok ? 200 : 500,
      }
    )

  } catch (error) {
    console.error('System mode error:', error)
    
    return new Response(
      JSON.stringify({
        ok: false,
        mode: 'DEMO',
        role: 'prospect',
        source: 'mock',
        tenant_category: 'demo',
        error: error.message || 'Erreur interne du serveur',
        badges: ['❌ Erreur système', 'Contactez le support'],
        capabilities: {
          canWrite: false,
          canExport: false,
          canSync: false
        },
        allowed_pages: ['dashboard'],
        features: {},
        traceId: crypto.randomUUID()
      } as ExtendedModeResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})