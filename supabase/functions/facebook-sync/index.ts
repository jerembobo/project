import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FacebookCampaign {
  id: string
  name: string
  status: string
  insights?: {
    data: Array<{
      spend: string
      impressions: string
      clicks: string
      actions?: Array<{
        action_type: string
        value: string
      }>
      action_values?: Array<{
        action_type: string
        value: string
      }>
    }>
  }
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

    const { access_token, ad_account_id, user_id } = await req.json()

    if (!access_token || !ad_account_id || !user_id) {
      throw new Error('Missing required parameters')
    }

    // Get campaigns with insights (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const since = thirtyDaysAgo.toISOString().split('T')[0]
    const until = new Date().toISOString().split('T')[0]

    const campaignsUrl = `https://graph.facebook.com/v18.0/act_${ad_account_id}/campaigns`
    const params = new URLSearchParams({
      access_token,
      fields: 'id,name,status,insights{spend,impressions,clicks,actions,action_values}',
      'insights.time_range': JSON.stringify({ since, until }),
      'insights.action_breakdowns': 'action_type',
      limit: '100'
    })

    const response = await fetch(`${campaignsUrl}?${params}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Facebook API error: ${errorData.error?.message || response.status}`)
    }

    const { data: campaigns }: { data: FacebookCampaign[] } = await response.json()

    // Process and insert campaigns
    const campaignsToUpsert = campaigns.map(campaign => {
      const insights = campaign.insights?.data?.[0]
      
      // Calculate metrics
      const spend = parseFloat(insights?.spend || '0')
      const impressions = parseInt(insights?.impressions || '0')
      const clicks = parseInt(insights?.clicks || '0')
      
      // Find purchase actions
      const purchases = insights?.actions?.find(action => 
        action.action_type === 'purchase' || action.action_type === 'offsite_conversion.fb_pixel_purchase'
      )
      const conversions = parseInt(purchases?.value || '0')
      
      // Find purchase values
      const purchaseValues = insights?.action_values?.find(action => 
        action.action_type === 'purchase' || action.action_type === 'offsite_conversion.fb_pixel_purchase'
      )
      const revenue = parseFloat(purchaseValues?.value || '0')
      
      // Calculate derived metrics
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
      const cpa = conversions > 0 ? spend / conversions : 0
      const roas = spend > 0 ? revenue / spend : 0

      return {
        user_id,
        platform: 'facebook' as const,
        campaign_id: campaign.id,
        name: campaign.name,
        status: campaign.status === 'ACTIVE' ? 'active' as const : 'paused' as const,
        spend,
        impressions,
        clicks,
        conversions,
        revenue,
        roas,
        ctr,
        cpa,
        updated_at: new Date().toISOString(),
      }
    })

    const { error: campaignsError } = await supabaseClient
      .from('campaigns')
      .upsert(campaignsToUpsert, { 
        onConflict: 'user_id,campaign_id',
        ignoreDuplicates: false 
      })

    if (campaignsError) {
      throw campaignsError
    }

    // Update user profile with Facebook info
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        facebook_ad_account_id: ad_account_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (profileError) {
      throw profileError
    }

    // Calculate totals
    const totals = campaignsToUpsert.reduce((acc, campaign) => ({
      spend: acc.spend + campaign.spend,
      revenue: acc.revenue + campaign.revenue,
      conversions: acc.conversions + campaign.conversions,
      impressions: acc.impressions + campaign.impressions,
    }), { spend: 0, revenue: 0, conversions: 0, impressions: 0 })

    return new Response(
      JSON.stringify({
        success: true,
        synced: {
          campaigns: campaigns.length,
          total_spend: totals.spend,
          total_revenue: totals.revenue,
          total_conversions: totals.conversions,
          average_roas: totals.spend > 0 ? totals.revenue / totals.spend : 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Facebook sync error:', error)
    
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