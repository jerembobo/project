import { MCPClient } from './mcpClient';

export interface FacebookCredentials {
  access_token: string;
  ad_account_id: string;
}

export interface FacebookCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'deleted';
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roas: number;
  ctr: number;
  cpa: number;
}

export interface FacebookInsight {
  campaign_id: string;
  date_start: string;
  date_stop: string;
  spend: number;
  impressions: number;
  clicks: number;
  actions: Array<{
    action_type: string;
    value: number;
  }>;
  action_values: Array<{
    action_type: string;
    value: number;
  }>;
}

export class FacebookMCP extends MCPClient {
  private credentials: FacebookCredentials | null = null;

  constructor() {
    super('facebook-mcp');
  }

  async authenticate(credentials: FacebookCredentials): Promise<boolean> {
    try {
      const response = await this.call('facebook.test_connection', {
        access_token: credentials.access_token,
        ad_account_id: credentials.ad_account_id
      });

      if (response.success) {
        this.credentials = credentials;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Facebook MCP authentication failed:', error);
      return false;
    }
  }

  async getCampaigns(): Promise<FacebookCampaign[]> {
    if (!this.credentials) {
      throw new Error('Not authenticated with Facebook');
    }

    const response = await this.call('facebook.get_campaigns', {
      access_token: this.credentials.access_token,
      ad_account_id: this.credentials.ad_account_id,
      fields: 'id,name,status',
      limit: 100
    });

    return response.campaigns || [];
  }

  async getCampaignInsights(campaignId: string, days: number = 30): Promise<FacebookInsight[]> {
    if (!this.credentials) {
      throw new Error('Not authenticated with Facebook');
    }

    const response = await this.call('facebook.get_campaign_insights', {
      access_token: this.credentials.access_token,
      campaign_id: campaignId,
      days_back: days,
      fields: 'spend,impressions,clicks,actions,action_values'
    });

    return response.insights || [];
  }

  async syncCampaigns(): Promise<FacebookCampaign[]> {
    const campaigns = await this.getCampaigns();
    
    const campaignsWithInsights = await Promise.all(
      campaigns.map(async (campaign) => {
        const insights = await this.getCampaignInsights(campaign.id, 30);
        
        if (insights.length > 0) {
          const insight = insights[0];
          
          // Calculate metrics
          const purchases = insight.actions.find(a => 
            a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase'
          );
          const purchaseValues = insight.action_values.find(a => 
            a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase'
          );
          
          const conversions = purchases?.value || 0;
          const revenue = purchaseValues?.value || 0;
          const ctr = insight.impressions > 0 ? (insight.clicks / insight.impressions) * 100 : 0;
          const cpa = conversions > 0 ? insight.spend / conversions : 0;
          const roas = insight.spend > 0 ? revenue / insight.spend : 0;

          return {
            ...campaign,
            spend: insight.spend,
            impressions: insight.impressions,
            clicks: insight.clicks,
            conversions,
            revenue,
            roas,
            ctr,
            cpa
          };
        }
        
        return {
          ...campaign,
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          roas: 0,
          ctr: 0,
          cpa: 0
        };
      })
    );

    return campaignsWithInsights;
  }

  async updateCampaignBudget(campaignId: string, dailyBudget: number): Promise<boolean> {
    if (!this.credentials) {
      throw new Error('Not authenticated with Facebook');
    }

    const response = await this.call('facebook.update_campaign_budget', {
      access_token: this.credentials.access_token,
      campaign_id: campaignId,
      daily_budget: dailyBudget * 100 // Facebook uses cents
    });

    return response.success || false;
  }

  async pauseCampaign(campaignId: string): Promise<boolean> {
    if (!this.credentials) {
      throw new Error('Not authenticated with Facebook');
    }

    const response = await this.call('facebook.update_campaign_status', {
      access_token: this.credentials.access_token,
      campaign_id: campaignId,
      status: 'PAUSED'
    });

    return response.success || false;
  }

  async activateCampaign(campaignId: string): Promise<boolean> {
    if (!this.credentials) {
      throw new Error('Not authenticated with Facebook');
    }

    const response = await this.call('facebook.update_campaign_status', {
      access_token: this.credentials.access_token,
      campaign_id: campaignId,
      status: 'ACTIVE'
    });

    return response.success || false;
  }
}