import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';

interface ShopifyCredentials {
  shop_url: string;
  access_token: string;
}

interface ShopifySyncResponse {
  success: boolean;
  synced?: {
    products: number;
    orders: number;
    revenue_30d: number;
  };
  error?: string;
}

export const useShopifySync = () => {
  const { user } = useAuthStore();
  const { addNotification } = useAppStore();

  const syncMutation = useMutation({
    mutationFn: async (credentials: ShopifyCredentials): Promise<ShopifySyncResponse> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('shopify-sync', {
        body: {
          shop_url: credentials.shop_url,
          access_token: credentials.access_token,
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
          title: 'Synchronisation Shopify réussie',
          message: `${data.synced.products} produits et ${data.synced.orders} commandes synchronisés`,
        });
      }
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Erreur de synchronisation Shopify',
        message: error.message || 'Une erreur est survenue',
      });
    },
  });

  const testConnection = async (credentials: ShopifyCredentials) => {
    try {
      const response = await fetch(`${credentials.shop_url}/admin/api/2023-10/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': credentials.access_token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Connexion échouée - Vérifiez vos identifiants');
      }

      const data = await response.json();
      return {
        success: true,
        shop: data.shop,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  return {
    syncShopify: syncMutation.mutate,
    testConnection,
    isLoading: syncMutation.isPending,
    error: syncMutation.error,
  };
};