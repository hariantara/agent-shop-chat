import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";

// Multiple Models Strategy Configuration
const MODEL_CONFIGS = [
  {
    name: "microsoft/Phi-4",
    tier: "low",
    dailyLimit: 150,
    description: "High quota, excellent for general conversation"
  },
  {
    name: "meta-llama/Llama-3.3-70B-Instruct", 
    tier: "low",
    dailyLimit: 150,
    description: "High quota, great for complex reasoning"
  },
  {
    name: "openai/gpt-4o-mini",
    tier: "high", 
    dailyLimit: 50,
    description: "Premium model, good for complex tasks"
  },
  {
    name: "xai/grok-3-mini",
    tier: "grok",
    dailyLimit: 30,
    description: "Conversational AI with personality"
  },
  {
    name: "openai/gpt-4o",
    tier: "high",
    dailyLimit: 50,
    description: "Most capable model for complex requests"
  }
];

// Rate limit tracking interface
interface ModelUsage {
  modelName: string;
  requestCount: number;
  lastResetDate: string;
  isBlocked: boolean;
  lastError?: string;
}

// Base system prompt for natural conversation and product card support
const BASE_SYSTEM_PROMPT = `
You are a friendly and helpful AI shopping assistant. Your role is to help customers find products they're looking for on their Shopify store.

**Your Personality:**
- Be warm, conversational, and natural in your responses
- Ask follow-up questions to better understand what they need
- Use casual, friendly language like you're talking to a friend
- Show enthusiasm about helping them find the perfect product
- Be patient and helpful, even if they're not sure what they want

**Your Capabilities:**
- Help customers find specific products
- Suggest alternatives if something isn't available
- Answer questions about product features, pricing, and availability
- Help with sizing, colors, and other product details
- Provide shopping recommendations based on their needs
- Help with the shopping process and checkout

**Conversation Style:**
- Use natural language and avoid robotic responses
- Ask clarifying questions when needed
- Provide helpful suggestions and alternatives
- Be encouraging and supportive
- Use emojis occasionally to make conversations more friendly

**Product Card Format:**
If you mention or recommend specific products, always include a JSON block in your response with this format:
{
  "products": [
    {
      "name": "Product Name",
      "image": "https://example.com/image.jpg", // Always include an image URL if available, or set to null/empty string
      "description": "Short description of the product.",
      "url": "https://shop.com/product-url",
      "salePrice": "$19.99", // Sale price, if available, or null/empty string
      "actualPrice": "$24.99", // Regular price, or null/empty string
      "category": "Socks" // Product category, if available, or null/empty string
    }
  ]
}
- The JSON block should be valid and appear in the message before your reply text.
- If any field is not available, set it to null or an empty string.
- Only recommend products that have a non-empty image field. Ignore products with no image.
- Never use code blocks (triple backticks) when outputting the product JSON. Output the JSON as plain text at the start of your message.
- The rest of your reply should be a friendly, helpful message as usual.

Always maintain a helpful, friendly tone and focus on making the shopping experience enjoyable and easy for the customer.
`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StoreInfo {
  url: string;
  name?: string;
  description?: string;
  products?: any[];
}

export class AIService {
  private client: any;
  private storeInfo: StoreInfo | null = null;
  private modelUsage: Map<string, ModelUsage> = new Map();
  private currentModelIndex: number = 0;

  constructor() {
    if (!token) {
      throw new Error("GITHUB_TOKEN environment variable is required");
    }
    this.client = ModelClient(endpoint, new AzureKeyCredential(token));
    this.initializeModelUsage();
  }

  private initializeModelUsage(): void {
    const today = new Date().toDateString();
    
    // Load usage from localStorage if available (browser) or initialize fresh
    const savedUsage = typeof window !== 'undefined' ? 
      localStorage.getItem('github-models-usage') : null;
    
    if (savedUsage) {
      try {
        const parsed = JSON.parse(savedUsage);
        for (const [modelName, usage] of Object.entries(parsed)) {
          const modelUsage = usage as ModelUsage;
          // Reset if it's a new day
          if (modelUsage.lastResetDate !== today) {
            modelUsage.requestCount = 0;
            modelUsage.isBlocked = false;
            modelUsage.lastResetDate = today;
            modelUsage.lastError = undefined;
          }
          this.modelUsage.set(modelName, modelUsage);
        }
      } catch (error) {
        console.warn('[AIService] Failed to parse saved usage data:', error);
      }
    }

    // Initialize any missing models
    MODEL_CONFIGS.forEach(config => {
      if (!this.modelUsage.has(config.name)) {
        this.modelUsage.set(config.name, {
          modelName: config.name,
          requestCount: 0,
          lastResetDate: today,
          isBlocked: false
        });
      }
    });
  }

  private saveModelUsage(): void {
    if (typeof window !== 'undefined') {
      const usageObj = Object.fromEntries(this.modelUsage);
      localStorage.setItem('github-models-usage', JSON.stringify(usageObj));
    }
  }

  private getAvailableModel(): { config: typeof MODEL_CONFIGS[0], usage: ModelUsage } | null {
    const today = new Date().toDateString();
    
    // Reset daily counters if it's a new day
    this.modelUsage.forEach((usage, modelName) => {
      if (usage.lastResetDate !== today) {
        usage.requestCount = 0;
        usage.isBlocked = false;
        usage.lastResetDate = today;
        usage.lastError = undefined;
      }
    });

    // Find the first available model (not blocked and under limit)
    for (let i = 0; i < MODEL_CONFIGS.length; i++) {
      const configIndex = (this.currentModelIndex + i) % MODEL_CONFIGS.length;
      const config = MODEL_CONFIGS[configIndex];
      const usage = this.modelUsage.get(config.name);
      
      if (usage && !usage.isBlocked && usage.requestCount < config.dailyLimit) {
        // Update current model index for next time
        this.currentModelIndex = configIndex;
        return { config, usage };
      }
    }
    
    return null; // All models are blocked or at limit
  }

  private markModelAsBlocked(modelName: string, error: string): void {
    const usage = this.modelUsage.get(modelName);
    if (usage) {
      usage.isBlocked = true;
      usage.lastError = error;
      this.saveModelUsage();
      console.warn(`[AIService] Model ${modelName} marked as blocked: ${error}`);
    }
  }

  private incrementModelUsage(modelName: string): void {
    const usage = this.modelUsage.get(modelName);
    if (usage) {
      usage.requestCount++;
      this.saveModelUsage();
      console.log(`[AIService] ${modelName} usage: ${usage.requestCount}/${MODEL_CONFIGS.find(c => c.name === modelName)?.dailyLimit || 0}`);
    }
  }

  private isRateLimitError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code?.toLowerCase() || '';
    
    return errorMessage.includes('rate limit') || 
           errorMessage.includes('too many requests') ||
           errorMessage.includes('quota exceeded') ||
           errorCode === '429' ||
           errorCode === 'rate_limit_exceeded';
  }

  async setStoreInfo(storeUrl: string): Promise<void> {
    try {
      // Extract store information from Shopify URL
      const storeName = this.extractStoreName(storeUrl);
      let products: any[] = [];
      let isShopifyStore = false;
      
      try {
        const productsUrl = storeUrl.replace(/\/$/, '') + '/products.json';
        const res = await fetch(productsUrl);
        
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          
          // Check if response is JSON (Shopify store)
          if (contentType && contentType.includes('application/json')) {
            isShopifyStore = true;
            const data = await res.json();
            if (data && Array.isArray(data.products)) {
              const totalProducts = data.products.length;
              
              products = data.products
                .filter((product: any) => {
                  // Filter out products that are out of stock
                  if (!product.variants || product.variants.length === 0) return false;
                  
                  // Check if any variant is available
                  const hasAvailableVariant = product.variants.some((variant: any) => 
                    variant.available === true || 
                    (variant.inventory_quantity && variant.inventory_quantity > 0)
                  );
                  
                  return hasAvailableVariant;
                })
                .map((product: any) => ({
                  name: product.title,
                  image: product.images && product.images[0] ? product.images[0].src : '',
                  description: product.body_html ? product.body_html.replace(/<[^>]+>/g, '') : '',
                  url: `${storeUrl.replace(/\/$/, '')}/products/${product.handle}`,
                  salePrice: product.variants && product.variants[0] && product.variants[0].compare_at_price ? product.variants[0].compare_at_price : '',
                  actualPrice: product.variants && product.variants[0] && product.variants[0].price ? product.variants[0].price : '',
                  category: product.product_type || '',
                  inStock: true // Only in-stock products make it here
                }));
                
              console.log(`[AIService] Total products: ${totalProducts}, In-stock products: ${products.length}, Filtered out: ${totalProducts - products.length}`);
              if (products.length > 0) {
                console.log('[AIService] First in-stock product:', products[0]);
              }
            }
          } else {
            // Not a Shopify store - throw error
            console.warn(`[AIService] ${storeUrl} is not a Shopify store (content-type: ${contentType})`);
            throw new Error(`This URL is not a Shopify store. Please provide a valid Shopify store URL (e.g., mystore.myshopify.com or a custom domain that uses Shopify).`);
          }
        } else {
          console.warn(`[AIService] Failed to fetch products from ${productsUrl}: ${res.status}`);
          throw new Error(`Unable to access this store. Please check if the URL is correct and the store is publicly accessible.`);
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('not a Shopify store')) {
          throw err; // Re-throw our custom error
        }
        console.warn('[AIService] Error fetching products:', err);
        throw new Error(`Failed to connect to this store. Please verify it's a valid Shopify store URL.`);
      }
      
      // Only set store info if it's a valid Shopify store
      this.storeInfo = {
        url: storeUrl,
        name: storeName,
        description: `Shopify store: ${storeName}`,
        products: products
      };
      
      console.log(`Store set to: ${storeName} (Shopify store with ${products.length} products)`);
    } catch (error) {
      console.error("Error setting store info:", error);
      throw error; // Re-throw the error to be handled by the API
    }
  }

  private extractStoreName(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      // Extract store name from Shopify URL (e.g., mystore.myshopify.com -> mystore)
      const storeName = hostname.split('.')[0];
      return storeName.charAt(0).toUpperCase() + storeName.slice(1);
    } catch {
      return "Unknown Store";
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Get available model
    const availableModel = this.getAvailableModel();
    if (!availableModel) {
      const usageStatus = this.getUsageStatus();
      throw new Error(`All models have reached their daily limits. Usage status:\n${usageStatus}\n\nPlease try again tomorrow or consider upgrading to paid usage.`);
    }

    const { config: modelConfig, usage: modelUsage } = availableModel;
    console.log(`[AIService] Using model: ${modelConfig.name} (${modelUsage.requestCount}/${modelConfig.dailyLimit} requests used)`);

    try {
      // Create dynamic system prompt based on store info
      let systemPrompt = BASE_SYSTEM_PROMPT;
      
      if (this.storeInfo) {
        systemPrompt += `\n\n**Current Store Information:**
- Store Name: ${this.storeInfo.name}
- Store URL: ${this.storeInfo.url}
- Description: ${this.storeInfo.description}\n`;
        if (this.storeInfo.products && this.storeInfo.products.length > 0) {
          // Helper function to format prices consistently
          const formatPriceForAI = (price: string): string => {
            if (!price || price === '') return '';
            const numPrice = parseFloat(price);
            if (isNaN(numPrice)) return price;
            
            // If price is very large (like 2674000), assume it's IDR and convert to USD
            let finalPrice = numPrice;
            if (numPrice > 50000) {
              finalPrice = numPrice / 15500;
            }
            
            return finalPrice.toFixed(2);
          };

          // Limit to first 5 products and reduce description length for prompt size
          const productList = this.storeInfo.products.slice(0, 5).map(p => ({
            name: p.name,
            image: p.image,
            description: p.description ? p.description.substring(0, 50) + '...' : '',
            url: p.url,
            salePrice: formatPriceForAI(p.salePrice),
            actualPrice: formatPriceForAI(p.actualPrice),
            category: p.category
          }));
          systemPrompt += `\nProducts available:\n${JSON.stringify(productList)}\n\nOnly recommend from this list.`;
        }
      } else {
        systemPrompt += `\n\n**Note:** No store has been set yet. Please ask the user to provide their Shopify store URL first.`;
      }

      const systemMessage = {
        role: "system" as const,
        content: systemPrompt
      };

      // Truncate conversation history to avoid token limits (keep last 6 messages)
      const truncatedMessages = messages.slice(-6);
      
      const response = await this.client.path("/chat/completions").post({
        body: {
          messages: [systemMessage, ...truncatedMessages],
          model: modelConfig.name,
          temperature: 0.7,
          max_tokens: 4000,
          top_p: 0.95,
        },
      });

      if (isUnexpected(response)) {
        const errorMessage = `Model ${modelConfig.name} request failed: ${response.status} ${response.body?.error?.message || 'Unknown error'}`;
        
        // Check if it's a rate limit error
        if (this.isRateLimitError(response.body?.error)) {
          this.markModelAsBlocked(modelConfig.name, 'Rate limit exceeded');
          
          // Try with next available model
          const nextModel = this.getAvailableModel();
          if (nextModel && nextModel.config.name !== modelConfig.name) {
            console.log(`[AIService] Rate limit hit for ${modelConfig.name}, retrying with ${nextModel.config.name}`);
            return this.chat(messages); // Recursive call with next model
          }
        }
        
        throw new Error(errorMessage);
      }

      // Increment usage counter for successful request
      this.incrementModelUsage(modelConfig.name);

      const result = response.body.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
      
      console.log(`[AIService] Successfully got response from ${modelConfig.name}`);
      return result;

    } catch (error: any) {
      console.error(`[AIService] Error with model ${modelConfig.name}:`, error);
      
      // Check if it's a rate limit error
      if (this.isRateLimitError(error)) {
        this.markModelAsBlocked(modelConfig.name, 'Rate limit exceeded');
        
        // Try with next available model
        const nextModel = this.getAvailableModel();
        if (nextModel && nextModel.config.name !== modelConfig.name) {
          console.log(`[AIService] Rate limit hit for ${modelConfig.name}, retrying with ${nextModel.config.name}`);
          return this.chat(messages); // Recursive call with next model
        }
      }
      
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  }

  getUsageStatus(): string {
    const today = new Date().toDateString();
    let status = "📊 **Model Usage Status:**\n\n";
    
    MODEL_CONFIGS.forEach(config => {
      const usage = this.modelUsage.get(config.name);
      if (usage) {
        const percentage = Math.round((usage.requestCount / config.dailyLimit) * 100);
        const emoji = usage.isBlocked ? "🚫" : percentage >= 90 ? "⚠️" : percentage >= 50 ? "🟡" : "✅";
        
        status += `${emoji} **${config.name}**\n`;
        status += `   ${usage.requestCount}/${config.dailyLimit} requests (${percentage}%)\n`;
        status += `   Tier: ${config.tier} | ${config.description}\n`;
        if (usage.isBlocked && usage.lastError) {
          status += `   🚫 Blocked: ${usage.lastError}\n`;
        }
        status += `\n`;
      }
    });
    
    const totalUsed = Array.from(this.modelUsage.values()).reduce((sum, usage) => sum + usage.requestCount, 0);
    const totalAvailable = MODEL_CONFIGS.reduce((sum, config) => sum + config.dailyLimit, 0);
    
    status += `**Total Daily Usage:** ${totalUsed}/${totalAvailable} requests\n`;
    status += `**Resets:** Daily at midnight UTC`;
    
    return status;
  }

  getCurrentModel(): string {
    const availableModel = this.getAvailableModel();
    return availableModel ? availableModel.config.name : "No models available";
  }

  getStoreInfo(): StoreInfo | null {
    return this.storeInfo;
  }

  hasStoreSet(): boolean {
    return this.storeInfo !== null;
  }

  async listAvailableModels(): Promise<any[]> {
    try {
      const response = await this.client.path("/models").get();
      
      if (isUnexpected(response)) {
        console.error("Failed to fetch models:", response.body);
        return [];
      }
      
      return response.body.data || [];
    } catch (error) {
      console.error("Error fetching available models:", error);
      return [];
    }
  }

  async verifyModelAccess(): Promise<{ available: string[], unavailable: string[], summary: string }> {
    try {
      console.log('[AIService] Verifying access to all configured models...');
      const allModels = await this.listAvailableModels();
      const availableModelNames = allModels.map(model => model.id || model.name);
      
      const available: string[] = [];
      const unavailable: string[] = [];
      
      MODEL_CONFIGS.forEach(config => {
        if (availableModelNames.includes(config.name)) {
          available.push(config.name);
        } else {
          unavailable.push(config.name);
        }
      });
      
      const summary = `✅ Token Access Verification:
📊 Total Models Configured: ${MODEL_CONFIGS.length}
✅ Available with your token: ${available.length}
❌ Unavailable: ${unavailable.length}

🎯 Available Models (${available.length}):
${available.map(name => `   ✅ ${name}`).join('\n')}

${unavailable.length > 0 ? `⚠️ Unavailable Models (${unavailable.length}):
${unavailable.map(name => `   ❌ ${name}`).join('\n')}` : '🎉 All configured models are available!'}

💡 Your GITHUB_TOKEN can access ${available.length} different AI models!
📈 Total daily quota: ${MODEL_CONFIGS.filter(c => available.includes(c.name)).reduce((sum, c) => sum + c.dailyLimit, 0)} requests/day`;

      console.log('[AIService] Model verification complete:', { available, unavailable });
      return { available, unavailable, summary };
    } catch (error) {
      console.error('[AIService] Error verifying model access:', error);
      return {
        available: [],
        unavailable: MODEL_CONFIGS.map(c => c.name),
        summary: `❌ Error verifying model access: ${error}`
      };
    }
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
} 