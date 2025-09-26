export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          plan: 'free' | 'pro' | 'enterprise'
          shopify_store_url: string | null
          facebook_ad_account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'pro' | 'enterprise'
          shopify_store_url?: string | null
          facebook_ad_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'pro' | 'enterprise'
          shopify_store_url?: string | null
          facebook_ad_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          platform: 'facebook' | 'tiktok' | 'google'
          campaign_id: string
          name: string
          status: 'active' | 'paused' | 'deleted'
          budget: number
          spend: number
          impressions: number
          clicks: number
          conversions: number
          revenue: number
          roas: number
          ctr: number
          cpa: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'facebook' | 'tiktok' | 'google'
          campaign_id: string
          name: string
          status?: 'active' | 'paused' | 'deleted'
          budget?: number
          spend?: number
          impressions?: number
          clicks?: number
          conversions?: number
          revenue?: number
          roas?: number
          ctr?: number
          cpa?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'facebook' | 'tiktok' | 'google'
          campaign_id?: string
          name?: string
          status?: 'active' | 'paused' | 'deleted'
          budget?: number
          spend?: number
          impressions?: number
          clicks?: number
          conversions?: number
          revenue?: number
          roas?: number
          ctr?: number
          cpa?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          shopify_product_id: string
          title: string
          handle: string
          price: number
          cost: number | null
          margin: number | null
          inventory: number
          sales_30d: number
          revenue_30d: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shopify_product_id: string
          title: string
          handle: string
          price: number
          cost?: number | null
          margin?: number | null
          inventory?: number
          sales_30d?: number
          revenue_30d?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shopify_product_id?: string
          title?: string
          handle?: string
          price?: number
          cost?: number | null
          margin?: number | null
          inventory?: number
          sales_30d?: number
          revenue_30d?: number
          created_at?: string
          updated_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          type: 'facebook' | 'shopify' | 'pricing' | 'general'
          category: string
          title: string
          description: string
          impact: 'high' | 'medium' | 'low'
          estimated_roi: number
          status: 'pending' | 'implemented' | 'rejected'
          confidence: number
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'facebook' | 'shopify' | 'pricing' | 'general'
          category: string
          title: string
          description: string
          impact: 'high' | 'medium' | 'low'
          estimated_roi: number
          status?: 'pending' | 'implemented' | 'rejected'
          confidence: number
          data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'facebook' | 'shopify' | 'pricing' | 'general'
          category?: string
          title?: string
          description?: string
          impact?: 'high' | 'medium' | 'low'
          estimated_roi?: number
          status?: 'pending' | 'implemented' | 'rejected'
          confidence?: number
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      ai_resources: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          type: 'document' | 'template' | 'knowledge'
          category: string
          tags: string[]
          embedding: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          type: 'document' | 'template' | 'knowledge'
          category: string
          tags?: string[]
          embedding?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          type?: 'document' | 'template' | 'knowledge'
          category?: string
          tags?: string[]
          embedding?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}