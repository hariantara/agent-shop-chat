# 🤖 AI Shop Chat

A modern AI-powered shopping assistant with WhatsApp-style UI that helps customers find products and get recommendations from Shopify stores. Built with Next.js, TypeScript, and multiple AI models for maximum reliability.

![AI Shop Chat](https://img.shields.io/badge/Next.js-14.0.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)
![GitHub Models](https://img.shields.io/badge/GitHub_Models-API-181717?style=for-the-badge&logo=github)
![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-00C7B7?style=for-the-badge&logo=vercel)

## 🚀 **DEMO PROJECT**

**Try the live application now!**

👉 **[https://agent-shop-chat.vercel.app/](https://agent-shop-chat.vercel.app/)**

**What you can test:**
- 🤖 **AI Chat Interface** - WhatsApp-style UI with real AI responses
- 🏪 **Connect Shopify Stores** - Try with Allbirds, Kith, or any Shopify store
- 📊 **Model Usage Dashboard** - See AI model rotation in action
- 💬 **Product Recommendations** - Get real product suggestions from stores

**Quick Demo Steps:**
1. Visit [https://agent-shop-chat.vercel.app/](https://agent-shop-chat.vercel.app/)
2. Click the **"+"** button to connect a store
3. Try: `https://allbirds.com` or `https://kith.com`
4. Ask: "What shoes do you recommend?" or "Show me your best sellers"

---

## ✨ Features

### 🛍️ **Smart Shopping Assistant**
- **Natural Conversation**: AI with friendly, conversational personality
- **Product Recommendations**: Real-time product suggestions from Shopify stores
- **Stock Filtering**: Only shows in-stock products to customers
- **Price Conversion**: Smart IDR to USD conversion for Indonesian stores

### 🔄 **Multiple AI Models Strategy**
- **5 AI Models**: Phi-4, Llama-3.3-70B, GPT-4o-mini, Grok-3-mini, GPT-4o
- **Automatic Rotation**: Switches models when rate limits are hit
- **380+ Daily Requests**: Combined quota across all models
- **Real-time Usage Tracking**: Monitor model usage and quotas

### 🎨 **WhatsApp-Style UI**
- **Familiar Interface**: Green color scheme (#25D366) matching WhatsApp
- **Message Bubbles**: Proper chat layout with user/assistant messages
- **Responsive Design**: Works perfectly on mobile and desktop
- **Typing Indicators**: Animated dots while AI is thinking

### 🏪 **Shopify Integration**
- **Real Product Data**: Fetches actual products from Shopify stores
- **Store Validation**: Only accepts valid Shopify stores
- **Product Cards**: Beautiful display with images, prices, and descriptions
- **Category Filtering**: Organize products by category

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- GitHub account with access to GitHub Models
- Shopify store for testing

### 1. Clone the Repository
```bash
git clone https://github.com/hariantara/agent-shop-chat.git
cd agent-shop-chat
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```env
GITHUB_TOKEN=your_github_personal_access_token
```

**Getting GitHub Token:**
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with `read:packages` scope
3. Copy the token to your `.env.local` file

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 5. Test the Application
Once your app is running, test it with these steps:

1. **Connect a Test Store:**
   - Click the **"+"** button in the header
   - Enter: `https://allbirds.com`
   - Click **"Connect Store"**

2. **Try These Test Conversations:**
   ```
   "What shoes do you recommend for walking?"
   "Show me your best sellers"
   "Do you have anything under $100?"
   "What's the most comfortable shoe?"
   ```

3. **Check Model Usage:**
   - Click the **bar chart icon** in the header
   - Verify your GitHub token works
   - Monitor AI model usage

**Quick Test Stores:**
- `https://allbirds.com` - Shoes and apparel
- `https://kith.com` - Streetwear
- `https://glossier.com` - Beauty products
- `https://brooklinen.com` - Home goods

## 🏪 Connecting Shopify Stores

### Supported Stores
The application works with any Shopify store. Here are some popular examples for testing:

#### 🛍️ **Fashion & Apparel**
- `https://allbirds.com` ✅ - Sustainable footwear and apparel
- `https://kith.com` ✅ - Streetwear and sneakers
- `https://gymshark.com` - Athletic wear and fitness clothing
- `https://glossier.com` - Beauty and skincare products
- `https://fashionnova.com` - Women's fashion and accessories
- `https://reformation.com` - Sustainable women's clothing
- `https://everlane.com` - Ethical basics and essentials

#### 💄 **Beauty & Cosmetics**
- `https://kyliecosmetics.com` - Celebrity makeup brand
- `https://fentybeauty.com` - Inclusive beauty products
- `https://morphe.com` - Professional makeup and brushes
- `https://colourpop.com` - Affordable cosmetics

#### 🏠 **Home & Lifestyle**
- `https://brooklinen.com` - Luxury bedding and home goods
- `https://casper.com` - Mattresses and sleep products
- `https://outdoorvoices.com` - Activewear and lifestyle
- `https://pelacase.com` - Eco-friendly phone cases

#### 🍔 **Food & Beverages**
- `https://shop.dunkindonuts.com` - Coffee and donuts
- `https://store.starbucks.com` - Coffee and merchandise
- `https://drinkcirkul.com` - Flavored water products

#### ⌚ **Electronics & Accessories**
- `https://mvmt.com` - Watches and accessories
- `https://popsockets.com` - Phone grips and accessories
- `https://nomadgoods.com` - Tech accessories and cases

#### 🎨 **Art & Design**
- `https://society6.com` - Art prints and home decor
- `https://redbubble.com` - Custom art and merchandise

### Testing Recommendations

**For Best Testing Experience:**
1. **Start with Allbirds** (`https://allbirds.com`) - Reliable, good product variety
2. **Try Kith** (`https://kith.com`) - Fashion items, different category
3. **Test Glossier** (`https://glossier.com`) - Beauty products, different audience
4. **Explore Brooklinen** (`https://brooklinen.com`) - Home goods, different price range

**Quick Test URLs:**
```bash
# Fashion
https://allbirds.com
https://kith.com
https://gymshark.com

# Beauty
https://glossier.com
https://kyliecosmetics.com

# Home
https://brooklinen.com
https://casper.com

# Tech
https://mvmt.com
https://nomadgoods.com
```

### How to Connect
1. Click the **"+"** button in the header
2. Enter your Shopify store URL
3. Click **"Connect Store"**
4. The AI will load all available products

### Store Validation
- ✅ **Shopify stores**: Full functionality with product data
- ❌ **Non-Shopify stores**: Clear error message explaining why they won't work

**Pro Tip:** If you're unsure if a store uses Shopify, try adding `/products.json` to the URL. If it returns JSON data, it's a Shopify store!

## 🤖 AI Models Configuration

### Available Models
| Model | Daily Limit | Tier | Description |
|-------|-------------|------|-------------|
| xai/grok-3-mini | 30 | Grok | Conversational AI with personality - great for natural chat |
| openai/gpt-4o-mini | 50 | High | Premium model with excellent conversation quality |
| openai/gpt-4o | 50 | High | Most capable model for complex requests |
| meta-llama/Llama-3.3-70B-Instruct | 150 | Low | High quota, great for complex reasoning |
| microsoft/Phi-4 | 150 | Low | High quota, good for general tasks |

### Automatic Model Rotation
- **Smart Selection**: Prioritizes models with highest quotas
- **Rate Limit Handling**: Automatically switches when limits are hit
- **Usage Tracking**: Real-time monitoring of request counts
- **Daily Reset**: Quotas reset at midnight UTC

## 📱 Usage

### For Store Owners
1. **Connect Your Store**: Add your Shopify store URL
2. **Test the AI**: Ask about products, pricing, and recommendations
3. **Monitor Usage**: Check model usage in the dashboard
4. **Share with Customers**: Let customers chat with your AI assistant

### For Customers
1. **Start Chatting**: Type natural questions about products
2. **Get Recommendations**: AI suggests products based on your needs
3. **View Product Cards**: See images, prices, and descriptions
4. **Click to Shop**: Direct links to product pages

### Example Conversations
```
Customer: "I'm looking for comfortable shoes for walking"
AI: "I found some great options! Here are our most comfortable shoes..."

Customer: "What's your best seller?"
AI: "Our best seller is the Wool Runner. Here's why customers love it..."

Customer: "Do you have anything under $50?"
AI: "Yes! Here are some affordable options within your budget..."
```

## 🛠️ Technical Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **GitHub Models API** - Multiple LLM access
- **Shopify Products API** - Real product data

### AI Integration
- **@azure-rest/ai-inference** - Azure AI SDK
- **Multiple Models** - Automatic failover and rotation
- **Rate Limit Management** - Smart quota handling

## 📊 Features in Detail

### Model Usage Dashboard
- **Real-time Status**: See which model is currently active
- **Usage Tracking**: Monitor requests per model
- **Token Verification**: Test GitHub token access
- **Quota Information**: Daily limits and remaining requests

### Product Management
- **Stock Filtering**: Only in-stock products shown
- **Price Formatting**: Consistent USD display
- **Image Handling**: Fallback for missing images
- **Category Organization**: Product categorization

### Error Handling
- **Graceful Failures**: Clear error messages for users
- **Model Failover**: Automatic switching on rate limits
- **Store Validation**: Proper Shopify store detection
- **Network Resilience**: Retry logic for API calls

## 🔧 Development

### Project Structure
```
agent-shop-chat/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ChatContainer.tsx  # Main chat interface
│   ├── ChatInput.tsx      # Message input
│   ├── ChatMessage.tsx    # Individual messages
│   ├── ProductCard.tsx    # Product display
│   └── StoreSetup.tsx     # Store connection
├── lib/                   # Utility functions
│   ├── ai-service.ts      # AI integration
│   └── utils.ts           # Helper functions
└── public/                # Static assets
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`

### Environment Variables
Make sure to set these in your deployment platform:
```env
GITHUB_TOKEN=your_github_token
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **GitHub Models** for providing access to multiple AI models
- **Shopify** for the products API
- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first styling

## 📞 Support

If you have any questions or need help:
- Open an [Issue](https://github.com/hariantara/agent-shop-chat/issues)
- Check the [GitHub repository](https://github.com/hariantara/agent-shop-chat)

---

**Made with ❤️ by [hariantara](https://github.com/hariantara)** 