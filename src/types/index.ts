// Types globaux pour l'application KAPEHI
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface NavigationItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface FacebookMetrics {
  roas: number;
  ctr: number;
  cpa: number;
  conversionRate: number;
  impressions: number;
  clicks: number;
  spend: number;
}

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  status: 'pending' | 'implemented' | 'rejected';
  estimatedRoi: number;
}

export interface PricingStrategy {
  id: string;
  name: string;
  method: 'cost-plus' | 'markup' | 'value-based' | 'competition-based' | 'psychological';
  currentPrice: number;
  suggestedPrice: number;
  expectedRoi: number;
}

export interface BusinessCost {
  id: string;
  name: string;
  category: 'marketing' | 'operational' | 'personnel' | 'technology' | 'administrative' | 'financial';
  type: 'fixed' | 'variable';
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  impact: number;
}