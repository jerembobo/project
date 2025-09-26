import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import type { Database } from '../types/database';

type Campaign = Database['public']['Tables']['campaigns']['Row'];
type CampaignInsert = Database['public']['Tables']['campaigns']['Insert'];
type CampaignUpdate = Database['public']['Tables']['campaigns']['Update'];

export const useCampaigns = () => {
  const { user } = useAuthStore();
  const { selectedTimeframe, filters } = useAppStore();
  const queryClient = useQueryClient();

  const campaignsQuery = useQuery({
    queryKey: ['campaigns', user?.id, selectedTimeframe, filters],
    queryFn: async (): Promise<Campaign[]> => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      // Apply filters
      if (filters.platform && filters.platform !== 'all') {
        query = query.eq('platform', filters.platform);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply date range filter
      const daysAgo = parseInt(selectedTimeframe);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      query = query.gte('updated_at', startDate.toISOString());

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaign: CampaignInsert): Promise<Campaign> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('campaigns')
        .insert({ ...campaign, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CampaignUpdate }): Promise<Campaign> => {
      const { data, error } = await supabase
        .from('campaigns')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  // Computed metrics
  const metrics = campaignsQuery.data ? {
    totalSpend: campaignsQuery.data.reduce((sum, c) => sum + (c.spend || 0), 0),
    totalRevenue: campaignsQuery.data.reduce((sum, c) => sum + (c.revenue || 0), 0),
    totalConversions: campaignsQuery.data.reduce((sum, c) => sum + (c.conversions || 0), 0),
    averageRoas: campaignsQuery.data.length > 0 
      ? campaignsQuery.data.reduce((sum, c) => sum + (c.roas || 0), 0) / campaignsQuery.data.length 
      : 0,
    averageCtr: campaignsQuery.data.length > 0 
      ? campaignsQuery.data.reduce((sum, c) => sum + (c.ctr || 0), 0) / campaignsQuery.data.length 
      : 0,
    averageCpa: campaignsQuery.data.length > 0 
      ? campaignsQuery.data.reduce((sum, c) => sum + (c.cpa || 0), 0) / campaignsQuery.data.length 
      : 0,
  } : null;

  return {
    campaigns: campaignsQuery.data || [],
    metrics,
    isLoading: campaignsQuery.isLoading,
    error: campaignsQuery.error,
    createCampaign: createCampaignMutation.mutate,
    updateCampaign: updateCampaignMutation.mutate,
    deleteCampaign: deleteCampaignMutation.mutate,
    isCreating: createCampaignMutation.isPending,
    isUpdating: updateCampaignMutation.isPending,
    isDeleting: deleteCampaignMutation.isPending,
  };
};