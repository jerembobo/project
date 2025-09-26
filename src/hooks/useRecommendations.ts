import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import type { Database } from '../types/database';

type Recommendation = Database['public']['Tables']['recommendations']['Row'];
type RecommendationInsert = Database['public']['Tables']['recommendations']['Insert'];
type RecommendationUpdate = Database['public']['Tables']['recommendations']['Update'];

export const useRecommendations = (type?: string, category?: string) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const recommendationsQuery = useQuery({
    queryKey: ['recommendations', user?.id, type, category],
    queryFn: async (): Promise<Recommendation[]> => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const updateRecommendationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: RecommendationUpdate }): Promise<Recommendation> => {
      const { data, error } = await supabase
        .from('recommendations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const createRecommendationMutation = useMutation({
    mutationFn: async (recommendation: RecommendationInsert): Promise<Recommendation> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('recommendations')
        .insert({ ...recommendation, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  // Filter recommendations by status
  const pendingRecommendations = recommendationsQuery.data?.filter(r => r.status === 'pending') || [];
  const implementedRecommendations = recommendationsQuery.data?.filter(r => r.status === 'implemented') || [];
  const rejectedRecommendations = recommendationsQuery.data?.filter(r => r.status === 'rejected') || [];

  // Calculate total estimated ROI
  const totalEstimatedRoi = pendingRecommendations.reduce((sum, r) => sum + (r.estimated_roi || 0), 0);

  return {
    recommendations: recommendationsQuery.data || [],
    pendingRecommendations,
    implementedRecommendations,
    rejectedRecommendations,
    totalEstimatedRoi,
    isLoading: recommendationsQuery.isLoading,
    error: recommendationsQuery.error,
    updateRecommendation: updateRecommendationMutation.mutate,
    createRecommendation: createRecommendationMutation.mutate,
    isUpdating: updateRecommendationMutation.isPending,
    isCreating: createRecommendationMutation.isPending,
  };
};