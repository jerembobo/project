import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface MCPRequest {
  method: string
  params: Record<string, any>
  id: string
}

interface MCPResponse {
  success: boolean
  data?: any
  error?: string
  id: string
}

// Configuration pour simulation en développement
const USE_SIMULATION = Deno.env.get('USE_SIMULATION') === 'true'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const mcpRequest: MCPRequest = await req.json()
    console.log(`🔌 MCP Shopify Request: ${mcpRequest.method}`, mcpRequest.params)

    let response: MCPResponse

    // Router MCP
    switch (mcpRequest.method) {
      case 'shopify.test_connection':
        response = await testConnection(mcpRequest)
        break
      case 'shopify.sync_all':
        response = await syncAll(mcpRequest, supabaseClient)
        break
      case 'shopify.get_products':
        response = await getProducts(mcpRequest)
        break
      case 'shopify.get_orders':
        response = await getOrders(mcpRequest)
        break
      default:
        response = {
          success: false,
          error: `Method ${mcpRequest.method} not implemented`,
          id: mcpRequest.id
        }
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.success ? 200 : 400,
      }
    )

  } catch (error) {
    console.error('MCP Shopify Error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal MCP server error',
        id: 'unknown'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Test de connexion Shopify
async function testConnection(request: MCPRequest): Promise<MCPResponse> {
  const { shop_url, access_token } = request.params

  if (USE_SIMULATION) {
    return {
      success: true,
      data: { 
        success: true, 
        shop: { 
          name: 'BMB GC Azur (Simulation)', 
          domain: 'bmb-gc-azur-2307-01.myshopify.com' 
        } 
      },
      id: request.id
    }
  }

  try {
    const response = await fetch(`${shop_url}/admin/api/2024-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Shopify API Error: ${response.status} - Vérifiez vos identifiants`)
    }

    const data = await response.json()
    return {
      success: true,
      data: { 
        success: true, 
        shop: data.shop
      },
      id: request.id
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Connexion échouée: ${error.message}`,
      id: request.id
    }
  }
}

// Synchronisation complète avec pagination
async function syncAll(request: MCPRequest, supabaseClient: any): Promise<MCPResponse> {
  const { shop_url, access_token, user_id } = request.params

  if (USE_SIMULATION) {
    // Simulation avec plus de produits pour tester
    const simulatedProducts = Array.from({ length: 25 }, (_, i) => ({
      id: `sim_${i + 1}`,
      title: `Produit Simulé ${i + 1}`,
      handle: `produit-simule-${i + 1}`,
      price: Math.round((Math.random() * 200 + 20) * 100) / 100,
      inventory: Math.floor(Math.random() * 100),
      sales_30d: Math.floor(Math.random() * 50),
      revenue_30d: Math.round((Math.random() * 2000 + 100) * 100) / 100
    }))

    const simulatedOrders = Array.from({ length: 15 }, (_, i) => ({
      id: `order_sim_${i + 1}`,
      total_price: Math.round((Math.random() * 300 + 50) * 100) / 100,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      line_items: []
    }))

    return {
      success: true,
      data: {
        products: simulatedProducts,
        orders: simulatedOrders,
        revenue_30d: simulatedOrders.reduce((sum, order) => sum + order.total_price, 0)
      },
      id: request.id
    }
  }

  try {
    // 1. Récupération des produits avec pagination
    console.log('🔄 Début synchronisation produits...')
    const allProducts = await getAllProducts(shop_url, access_token)
    console.log(`✅ ${allProducts.length} produits récupérés`)

    // 2. Récupération des commandes (30 derniers jours)
    console.log('🔄 Début synchronisation commandes...')
    const allOrders = await getAllOrders(shop_url, access_token)
    console.log(`✅ ${allOrders.length} commandes récupérées`)

    // 3. Calcul des métriques par produit
    const productSales = calculateProductSales(allOrders)

    // 4. Transformation des données pour Supabase
    const productsToUpsert = allProducts.map(product => {
      const variant = product.variants[0]
      const sales = productSales.get(product.id) || { sales: 0, revenue: 0 }
      
      return {
        user_id,
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

    // 5. Sauvegarde en base
    const { error: productsError } = await supabaseClient
      .from('products')
      .upsert(productsToUpsert, { 
        onConflict: 'user_id,shopify_product_id',
        ignoreDuplicates: false 
      })

    if (productsError) {
      throw new Error(`Erreur sauvegarde produits: ${productsError.message}`)
    }

    // 6. Mise à jour du profil utilisateur
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        shopify_store_url: shop_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (profileError) {
      console.warn('Erreur mise à jour profil:', profileError.message)
    }

    const totalRevenue = Array.from(productSales.values()).reduce((sum, p) => sum + p.revenue, 0)

    return {
      success: true,
      data: {
        products: productsToUpsert,
        orders: allOrders,
        revenue_30d: totalRevenue
      },
      id: request.id
    }

  } catch (error: any) {
    console.error('Erreur sync_all:', error)
    return {
      success: false,
      error: `Synchronisation échouée: ${error.message}`,
      id: request.id
    }
  }
}

// Récupération de tous les produits avec pagination
async function getAllProducts(shop_url: string, access_token: string): Promise<any[]> {
  const allProducts: any[] = []
  let nextPageInfo: string | null = null
  let hasNextPage = true

  while (hasNextPage) {
    const url = new URL(`${shop_url}/admin/api/2024-10/products.json`)
    url.searchParams.set('limit', '250')
    if (nextPageInfo) {
      url.searchParams.set('page_info', nextPageInfo)
    }

    const response = await fetch(url.toString(), {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Shopify Products API Error: ${response.status}`)
    }

    const data = await response.json()
    allProducts.push(...data.products)

    // Gestion de la pagination via Link header
    const linkHeader = response.headers.get('Link')
    if (linkHeader && linkHeader.includes('rel="next"')) {
      const nextMatch = linkHeader.match(/<[^>]*page_info=([^&>]+)[^>]*>;\s*rel="next"/)
      nextPageInfo = nextMatch ? nextMatch[1] : null
      hasNextPage = !!nextPageInfo
    } else {
      hasNextPage = false
    }

    console.log(`📦 Produits récupérés: ${allProducts.length}`)
  }

  return allProducts
}

// Récupération de toutes les commandes (30 derniers jours)
async function getAllOrders(shop_url: string, access_token: string): Promise<any[]> {
  const allOrders: any[] = []
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  let nextPageInfo: string | null = null
  let hasNextPage = true

  while (hasNextPage) {
    const url = new URL(`${shop_url}/admin/api/2024-10/orders.json`)
    url.searchParams.set('limit', '250')
    url.searchParams.set('status', 'any')
    url.searchParams.set('created_at_min', thirtyDaysAgo.toISOString())
    if (nextPageInfo) {
      url.searchParams.set('page_info', nextPageInfo)
    }

    const response = await fetch(url.toString(), {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Shopify Orders API Error: ${response.status}`)
    }

    const data = await response.json()
    allOrders.push(...data.orders)

    // Gestion de la pagination
    const linkHeader = response.headers.get('Link')
    if (linkHeader && linkHeader.includes('rel="next"')) {
      const nextMatch = linkHeader.match(/<[^>]*page_info=([^&>]+)[^>]*>;\s*rel="next"/)
      nextPageInfo = nextMatch ? nextMatch[1] : null
      hasNextPage = !!nextPageInfo
    } else {
      hasNextPage = false
    }

    console.log(`🛒 Commandes récupérées: ${allOrders.length}`)
  }

  return allOrders
}

// Calcul des ventes par produit
function calculateProductSales(orders: any[]): Map<number, { sales: number; revenue: number }> {
  const productSales = new Map<number, { sales: number; revenue: number }>()
  
  orders.forEach(order => {
    order.line_items?.forEach((item: any) => {
      if (item.product_id) {
        const current = productSales.get(item.product_id) || { sales: 0, revenue: 0 }
        productSales.set(item.product_id, {
          sales: current.sales + item.quantity,
          revenue: current.revenue + (parseFloat(item.price) * item.quantity)
        })
      }
    })
  })

  return productSales
}

// Récupération des produits (pour dashboard)
async function getProducts(request: MCPRequest): Promise<MCPResponse> {
  // Cette méthode peut être utilisée pour des requêtes rapides sans pagination complète
  return await syncAll(request, null) // Réutilise la logique de sync_all
}

// Récupération des commandes (pour dashboard)
async function getOrders(request: MCPRequest): Promise<MCPResponse> {
  const { shop_url, access_token } = request.params

  if (USE_SIMULATION) {
    return {
      success: true,
      data: {
        orders: [
          {
            id: 'order_sim_1',
            total_price: 159.98,
            created_at: '2024-01-15T10:30:00Z',
            line_items: []
          }
        ]
      },
      id: request.id
    }
  }

  try {
    const orders = await getAllOrders(shop_url, access_token)
    return {
      success: true,
      data: { orders },
      id: request.id
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      id: request.id
    }
  }
}