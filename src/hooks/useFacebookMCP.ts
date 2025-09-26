import { useState, useCallback } from 'react';
import { FacebookMCP, FacebookCredentials, FacebookCampaign } from '../lib/mcp/facebookMCP';
import { useAppStore } from '../stores/appStore';

const facebookMCP = new FacebookMCP();

export const useFacebookMCP = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [campaigns, setCampaigns] = useState<FacebookCampaign[]>([]);
  const { addNotification } = useAppStore();

  const authenticate = useCallback(async (credentials: FacebookCredentials) => {
    setIsLoading(true);
    try {
      const success = await facebookMCP.authenticate(credentials);
      setIsAuthenticated(success);
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Connexion Facebook réussie',
          message: 'MCP Facebook Ads connecté avec succès'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Erreur de connexion Facebook',
          message: 'Vérifiez vos identifiants'
        });
      }
      
      return success;
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erreur MCP Facebook',
        message: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const syncCampaigns = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    
    setIsLoading(true);
    try {
      const syncedCampaigns = await facebookMCP.syncCampaigns();
      setCampaigns(syncedCampaigns);
      
      const totalSpend = syncedCampaigns.reduce((sum, c) => sum + c.spend, 0);
      const totalRevenue = syncedCampaigns.reduce((sum, c) => sum + c.revenue, 0);
      const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
      
      addNotification({
        type: 'success',
        title: 'Synchronisation Facebook réussie',
        message: `${syncedCampaigns.length} campagnes - ROAS moyen: ${avgRoas.toFixed(2)}x`
      });
      
      return syncedCampaigns;
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erreur de synchronisation Facebook',
        message: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, addNotification]);

  const updateCampaignBudget = useCallback(async (campaignId: string, dailyBudget: number) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    
    setIsLoading(true);
    try {
      const success = await facebookMCP.updateCampaignBudget(campaignId, dailyBudget);
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Budget mis à jour',
          message: `Budget quotidien: €${dailyBudget}`
        });
      }
      
      return success;
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erreur de mise à jour budget',
        message: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, addNotification]);

  const pauseCampaign = useCallback(async (campaignId: string) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    
    setIsLoading(true);
    try {
      const success = await facebookMCP.pauseCampaign(campaignId);
      
      if (success) {
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId ? { ...c, status: 'paused' } : c
        ));
        
        addNotification({
          type: 'success',
          title: 'Campagne mise en pause',
          message: 'La campagne a été pausée avec succès'
        });
      }
      
      return success;
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erreur de pause campagne',
        message: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, addNotification]);

  return {
    isLoading,
    isAuthenticated,
    campaigns,
    authenticate,
    syncCampaigns,
    updateCampaignBudget,
    pauseCampaign
  };
};