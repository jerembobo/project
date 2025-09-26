import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface ShopifyProduct {
  id: number
  title: string
  handle: string
  updated_at: string
  variants: Array<{
    id: number
    price: string
    inventory_quantity: number
  }>
}

interface ShopifyOrder {
  id: number
  total_price: string
  created_at: string
  processed_at: string
  line_items: Array<{
    product_id: number
    quantity: number
    price: string
  }>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { shop_url, access_token, tenant_id } = await req.json()

    if (!shop_url || !access_token || !tenant_id) {
      throw new Error('Missing required parameters')
    }

    console.log(`🚀 Starting mini-sync for tenant ${tenant_id}`)

    // Créer un enregistrement sync_runs
    const { data: syncRun, error: syncError } = await supabaseClient
      .from('sync_runs')
      .insert({
        tenant_id,
        kind: 'mini',
        status: 'running',
        counts: { products: 0, orders: 0 },
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (syncError) throw syncError

    const traceId = syncRun.id

    try {
      // 1. Mini-sync des produits (50 les plus récents)
      console.log('📦 Fetching recent products...')
      const productsResponse = await fetch(
        `${shop_url}/admin/api/2024-01/products.json?limit=50&fields=id,title,handle,updated_at,variants`,
        {
          headers: {
            'X-Shopify-Access-Token': access_token,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!productsResponse.ok) {
        throw new Error(`Shopify Products API error: ${productsResponse.status}`)
      }

      const { products }: { products: ShopifyProduct[] } = await productsResponse.json()

      // 2. Mini-sync des commandes (50 les plus récentes)
      console.log('🛒 Fetching recent orders...')
      const ordersResponse = await fetch(
        `${shop_url}/admin/api/2024-01/orders.json?limit=50&status=any&fields=id,total_price,created_at,processed_at,line_items`,
        {
          headers: {
            'X-Shopify-Access-Token': access_token,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!ordersResponse.ok) {
        throw new Error(`Shopify Orders API error: ${ordersResponse.status}`)
      }

      const { orders }: { orders: ShopifyOrder[] } = await ordersResponse.json()

      // 3. Calculer les ventes par produit (mini-dataset)
      const productSales = new Map<number, { sales: number; revenue: number }>()
      
      orders.forEach(order => {
        order.line_items?.forEach(item => {
          if (item.product_id) {
            const current = productSales.get(item.product_id) || { sales: 0, revenue: 0 }
            productSales.set(item.product_id, {
              sales: current.sales + item.quantity,
              revenue: current.revenue + (parseFloat(item.price) * item.quantity)
            })
          }
        })
      })

      // 4. Transformer et insérer les produits
      const productsToUpsert = products.map(product => {
        const variant = product.variants[0]
        const sales = productSales.get(product.id) || { sales: 0, revenue: 0 }
        
        return {
          tenant_id,
          shopify_product_id: product.id.toString(),
          title: product.title,
          handle: product.handle,
          price: parseFloat(variant?.price || '0'),
          inventory: variant?.inventory_quantity || 0,
          sales_30d: sales.sales,
          revenue_30d: sales.revenue,
          updated_at: new Date().toISOString(),
        }
      })

      const { error: productsError } = await supabaseClient
        .from('products')
        .upsert(productsToUpsert, { 
          onConflict: 'tenant_id,shopify_product_id',
          ignoreDuplicates: false 
        })

      if (productsError) {
        throw new Error(`Products upsert error: ${productsError.message}`)
      }

      // 5. Marquer Shopify comme connecté
      const { error: tenantError } = await supabaseClient
        .from('tenants')
        .update({ 
          shopify_connected: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenant_id)

      if (tenantError) {
        console.warn('Tenant update error:', tenantError.message)
      }

      // 6. Finaliser le sync_run
      const totalRevenue = Array.from(productSales.values()).reduce((sum, p) => sum + p.revenue, 0)

      const { error: finishError } = await supabaseClient
        .from('sync_runs')
        .update({
          status: 'success',
          counts: {
            products: products.length,
            orders: orders.length,
            revenue: totalRevenue
          },
          finished_at: new Date().toISOString()
        })
        .eq('id', traceId)

      if (finishError) {
        console.warn('Sync run finish error:', finishError.message)
      }

      console.log(`✅ Mini-sync completed: ${products.length} products, ${orders.length} orders`)

      return new Response(
        JSON.stringify({
          ok: true,
          mode: 'ONBOARDING',
          source: 'shopify_admin',
          counts: {
            products: products.length,
            orders: orders.length,
            revenue: totalRevenue
          },
          traceId,
          message: 'Mini-sync completed successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } catch (error: any) {
      // Marquer le sync comme échoué
      await supabaseClient
        .from('sync_runs')
        .update({
          status: 'failed',
          error_details: { message: error.message, stack: error.stack },
          finished_at: new Date().toISOString()
        })
        .eq('id', traceId)

      throw error
    }

  } catch (error) {
    console.error('Mini-sync error:', error)
    
    return new Response(
      JSON.stringify({ 
        ok: false,
        error: error.message || 'Mini-sync failed',
        traceId: 'unknown'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})