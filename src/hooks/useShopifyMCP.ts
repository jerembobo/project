import { useState, useCallback } from 'react';
import { ShopifyMCP, ShopifyCredentials, ShopifyProduct } from '../lib/mcp/shopifyMCP';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';

const shopifyMCP = new ShopifyMCP();

export const useShopifyMCP = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const { addNotification } = useAppStore();

  const authenticate = useCallback(async (credentials: ShopifyCredentials) => {
    setIsLoading(true);
    try {
      const success = await shopifyMCP.authenticate(credentials);
      setIsAuthenticated(success);
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Connexion Shopify réussie',
          message: 'MCP Shopify connecté avec succès'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Erreur de connexion Shopify',
          message: 'Vérifiez vos identifiants'
        });
      }
      
      return success;
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erreur MCP Shopify',
        message: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const syncProducts = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    
    if (!user) {
      throw new Error('User not logged in');
    }
    
    setIsLoading(true);
    try {
      // Synchronisation complète via MCP pur
      const syncedProducts = await shopifyMCP.syncData();
      setProducts(syncedProducts.products);
      
      addNotification({
        type: 'success',
        title: 'Synchronisation MCP réussie',
        message: `${syncedProducts.products.length} produits et ${syncedProducts.orders.length} commandes synchronisés`
      });
      
      return syncedProducts.products;
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erreur de synchronisation MCP',
        message: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, addNotification]);

  const updateProductPrice = useCallback(async (productId: string, newPrice: number) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    
    setIsLoading(true);
    try {
      const success = await shopifyMCP.updateProductPrice(productId, newPrice);
      
      if (success) {
        // Mettre à jour le produit localement
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, price: newPrice } : p
        ));
        
        addNotification({
          type: 'success',
          title: 'Prix mis à jour',
          message: `Prix du produit mis à jour: €${newPrice}`
        });
      }
      
      return success;
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erreur de mise à jour',
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
    products,
    authenticate,
    syncProducts,
    updateProductPrice
  };
};