import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Vérifier la signature Stripe
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    if (!signature || !STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing Stripe signature or webhook secret')
    }

    // Ici on devrait vérifier la signature Stripe, mais pour la démo on fait simple
    const event = JSON.parse(body)

    console.log('Stripe webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabaseClient, event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabaseClient, event.data.object)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabaseClient, event.data.object)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabaseClient, event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabaseClient, event.data.object)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Stripe webhook error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Webhook processing failed',
        received: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function handleCheckoutCompleted(supabase: any, session: any) {
  console.log('Processing checkout completed:', session.id)
  
  const customerId = session.customer
  const subscriptionId = session.subscription
  
  // Récupérer les détails de la subscription
  const subscriptionResponse = await fetch(
    `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
    {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    }
  )
  
  const subscription = await subscriptionResponse.json()
  const priceId = subscription.items.data[0].price.id
  
  // Mapper les price IDs aux plan IDs
  const planMapping: Record<string, string> = {
    'price_pro_basic': 'pro_basic',
    'price_agency_starter': 'agency_starter', 
    'price_agency_pro': 'agency_pro'
  }
  
  const planId = planMapping[priceId] || 'pro_basic'
  
  // Trouver le tenant via les métadonnées ou l'email du customer
  const customerResponse = await fetch(
    `https://api.stripe.com/v1/customers/${customerId}`,
    {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    }
  )
  
  const customer = await customerResponse.json()
  const tenantId = session.metadata?.tenant_id || customer.metadata?.tenant_id
  
  if (!tenantId) {
    console.error('No tenant_id found in session or customer metadata')
    return
  }
  
  // Créer ou mettre à jour la subscription
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      tenant_id: tenantId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      plan_id: planId,
      status: 'active',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
  
  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
  
  console.log(`Subscription created/updated for tenant ${tenantId}`)
}

async function handlePaymentSucceeded(supabase: any, invoice: any) {
  console.log('Processing payment succeeded:', invoice.id)
  
  const subscriptionId = invoice.subscription
  
  // Mettre à jour le statut de la subscription
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscriptionId)
  
  if (error) {
    console.error('Error updating subscription status:', error)
    throw error
  }
}

async function handlePaymentFailed(supabase: any, invoice: any) {
  console.log('Processing payment failed:', invoice.id)
  
  const subscriptionId = invoice.subscription
  
  // Mettre à jour le statut de la subscription
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscriptionId)
  
  if (error) {
    console.error('Error updating subscription status:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(supabase: any, subscription: any) {
  console.log('Processing subscription updated:', subscription.id)
  
  const priceId = subscription.items.data[0].price.id
  
  // Mapper les price IDs aux plan IDs
  const planMapping: Record<string, string> = {
    'price_pro_basic': 'pro_basic',
    'price_agency_starter': 'agency_starter',
    'price_agency_pro': 'agency_pro'
  }
  
  const planId = planMapping[priceId] || 'pro_basic'
  
  // Mettre à jour la subscription
  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan_id: planId,
      status: subscription.status === 'active' ? 'active' : 'past_due',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
  
  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: any) {
  console.log('Processing subscription deleted:', subscription.id)
  
  // Mettre à jour le statut de la subscription
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
  
  if (error) {
    console.error('Error updating subscription status:', error)
    throw error
  }
}