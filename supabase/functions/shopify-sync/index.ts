import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ShopifyProduct {
  id: number
  title: string
  handle: string
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

    const { shop_url, access_token, user_id } = await req.json()

    if (!shop_url || !access_token || !user_id) {
      throw new Error('Missing required parameters')
    }

    // Sync Products
    const productsResponse = await fetch(`${shop_url}/admin/api/2023-10/products.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
      },
    })

    if (!productsResponse.ok) {
      throw new Error(`Shopify API error: ${productsResponse.status}`)
    }

    const { products }: { products: ShopifyProduct[] } = await productsResponse.json()

    // Sync Orders (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const ordersResponse = await fetch(
      `${shop_url}/admin/api/2023-10/orders.json?status=any&created_at_min=${thirtyDaysAgo.toISOString()}`,
      {
        headers: {
          'X-Shopify-Access-Token': access_token,
          'Content-Type': 'application/json',
        },
      }
    )

    const { orders }: { orders: ShopifyOrder[] } = await ordersResponse.json()

    // Calculate sales data per product
    const productSales = new Map<number, { sales: number; revenue: number }>()
    
    orders.forEach(order => {
      order.line_items.forEach(item => {
        const current = productSales.get(item.product_id) || { sales: 0, revenue: 0 }
        productSales.set(item.product_id, {
          sales: current.sales + item.quantity,
          revenue: current.revenue + (parseFloat(item.price) * item.quantity)
        })
      })
    })

    // Insert/Update products in Supabase
    const productsToUpsert = products.map(product => {
      const variant = product.variants[0] // Take first variant
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

    const { error: productsError } = await supabaseClient
      .from('products')
      .upsert(productsToUpsert, { 
        onConflict: 'user_id,shopify_product_id',
        ignoreDuplicates: false 
      })

    if (productsError) {
      throw productsError
    }

    // Update user profile with Shopify info
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        shopify_store_url: shop_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (profileError) {
      throw profileError
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced: {
          products: products.length,
          orders: orders.length,
          revenue_30d: Array.from(productSales.values()).reduce((sum, p) => sum + p.revenue, 0)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Shopify sync error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})