export interface MCPRequest {
  method: string;
  params: Record<string, any>;
  id: string;
}

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  id: string;
}

abstract class MCPClient {
  protected serverName: string;
  private requestId = 0;

  constructor(serverName: string) {
    this.serverName = serverName;
  }

  protected async call(method: string, params: Record<string, any> = {}): Promise<any> {
    const id = `${this.serverName}-${++this.requestId}`;
    
    const request: MCPRequest = {
      method,
      params,
      id
    };

    try {
      // Appel MCP pur - plus de fallback simulation côté client
      const response = await this.callMCPServer(request);
      
      if (!response.success) {
        throw new Error(response.error || 'MCP call failed');
      }
      
      return response.data;
    } catch (error) {
      console.error(`MCP call failed for ${method}:`, error);
      throw error;
    }
  }

  // Appel au serveur MCP via Supabase Edge Functions
  private async callMCPServer(request: MCPRequest): Promise<MCPResponse> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const functionName = this.serverName.replace('-mcp', ''); // shopify-mcp -> shopify
    
    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}-mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MCP Server Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }
}

export { MCPClient };