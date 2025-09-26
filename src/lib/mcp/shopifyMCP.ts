import { MCPClient } from './mcpClient';

export interface ShopifyCredentials {
  shop_url: string;
  access_token: string;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  price: number;
  inventory: number;
  sales_30d: number;
  revenue_30d: number;
}

export interface ShopifyOrder {
  id: string;
  total_price: number;
  created_at: string;
  line_items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
}

export interface ShopifySyncResult {
  products: ShopifyProduct[];
  orders: ShopifyOrder[];
  revenue_30d: number;
}

export class ShopifyMCP extends MCPClient {
  private credentials: ShopifyCredentials | null = null;

  constructor() {
    super('shopify-mcp');
  }

  async authenticate(credentials: ShopifyCredentials): Promise<boolean> {
    try {
      const response = await this.call('shopify.test_connection', {
        shop_url: credentials.shop_url,
        access_token: credentials.access_token
      });

      if (response.success) {
        this.credentials = credentials;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Shopify MCP authentication failed:', error);
      return false;
    }
  }

  async syncData(): Promise<ShopifySyncResult> {
    if (!this.credentials) {
      throw new Error('Not authenticated with Shopify');
    }

    try {
      const response = await this.call('shopify.sync_all', {
        shop_url: this.credentials.shop_url,
        access_token: this.credentials.access_token,
        user_id: 'current_user' // TODO: Get from auth context
      });

      return {
        products: response.products || [],
        orders: response.orders || [],
        revenue_30d: response.revenue_30d || 0
      };
    } catch (error) {
      console.error('Erreur syncData:', error);
      throw new Error(`Synchronisation échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async getProducts(): Promise<ShopifyProduct[]> {
    if (!this.credentials) {
      throw new Error('Not authenticated with Shopify');
    }

    const response = await this.call('shopify.get_products', {
      shop_url: this.credentials.shop_url,
      access_token: this.credentials.access_token
    });

    return response.products || [];
  }

  async getOrders(days: number = 30): Promise<ShopifyOrder[]> {
    if (!this.credentials) {
      throw new Error('Not authenticated with Shopify');
    }

    const response = await this.call('shopify.get_orders', {
      shop_url: this.credentials.shop_url,
      access_token: this.credentials.access_token,
      days_back: days
    });

    return response.orders || [];
  }

  async updateProductPrice(productId: string, newPrice: number): Promise<boolean> {
    if (!this.credentials) {
      throw new Error('Not authenticated with Shopify');
    }

    const response = await this.call('shopify.update_product_price', {
      shop_url: this.credentials.shop_url,
      access_token: this.credentials.access_token,
      product_id: productId,
      price: newPrice
    });

    return response.success || false;
  }
}