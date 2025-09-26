import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';

interface FacebookCredentials {
  access_token: string;
  ad_account_id: string;
}

interface FacebookSyncResponse {
  success: boolean;
  synced?: {
    campaigns: number;
    total_spend: number;
    total_revenue: number;
    total_conversions: number;
    average_roas: number;
  };
  error?: string;
}

export const useFacebookSync = () => {
  const { user } = useAuthStore();
  const { addNotification } = useAppStore();

  const syncMutation = useMutation({
    mutationFn: async (credentials: FacebookCredentials): Promise<FacebookSyncResponse> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('facebook-sync', {
        body: {
          access_token: credentials.access_token,
          ad_account_id: credentials.ad_account_id,
          user_id: user.id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.synced) {
        addNotification({
          type: 'success',
          title: 'Synchronisation Facebook réussie',
          message: `${data.synced.campaigns} campagnes synchronisées - ROAS moyen: ${data.synced.average_roas.toFixed(2)}x`,
        });
      }
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Erreur de synchronisation Facebook',
        message: error.message || 'Une erreur est survenue',
      });
    },
  });

  const testConnection = async (credentials: FacebookCredentials) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/act_${credentials.ad_account_id}?fields=name,account_status&access_token=${credentials.access_token}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Connexion échouée');
      }

      const data = await response.json();
      return {
        success: true,
        account: data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  return {
    syncFacebook: syncMutation.mutate,
    testConnection,
    isLoading: syncMutation.isPending,
    error: syncMutation.error,
  };
};