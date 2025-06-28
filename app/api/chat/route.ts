import { NextRequest, NextResponse } from 'next/server';
import { getAIService, ChatMessage } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { messages, action, storeUrl } = await request.json();

    // Check if GITHUB_TOKEN is available
    if (!process.env.GITHUB_TOKEN) {
      console.error('GITHUB_TOKEN environment variable is missing');
      return NextResponse.json(
        { 
          error: 'GITHUB_TOKEN environment variable is required. Please check your .env.local file.',
          details: 'Make sure your .env.local file contains: GITHUB_TOKEN=your_token_here'
        },
        { status: 500 }
      );
    }

    const aiService = getAIService();

    // Handle store setup
    if (action === 'setStore' && storeUrl) {
      await aiService.setStoreInfo(storeUrl);
      return NextResponse.json({
        success: true,
        message: `Store connected successfully! I'm now ready to help customers with ${aiService.getStoreInfo()?.name}.`,
        storeInfo: aiService.getStoreInfo(),
        currentModel: aiService.getCurrentModel()
      });
    }

    // Handle model listing
    if (action === 'listModels') {
      const models = await aiService.listAvailableModels();
      return NextResponse.json({
        success: true,
        models: models,
        currentModel: aiService.getCurrentModel()
      });
    }

    // Handle token verification
    if (action === 'verifyToken') {
      try {
        const result = await aiService.verifyModelAccess();
        return NextResponse.json({
          success: true,
          summary: result.summary,
          currentModel: aiService.getCurrentModel()
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: error.message || 'Token verification failed',
          currentModel: aiService.getCurrentModel()
        }, { status: 500 });
      }
    }

    // Handle usage status
    if (action === 'getUsageStatus') {
      try {
        const usageStatus = aiService.getUsageStatus();
        return NextResponse.json({
          success: true,
          usageStatus: usageStatus,
          currentModel: aiService.getCurrentModel()
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: error.message || 'Failed to get usage status',
          currentModel: aiService.getCurrentModel()
        }, { status: 500 });
      }
    }

    // Handle chat messages
    if (messages && Array.isArray(messages)) {
      const response = await aiService.chat(messages as ChatMessage[]);

      return NextResponse.json({
        message: response,
        timestamp: new Date().toISOString(),
        storeInfo: aiService.getStoreInfo(),
        currentModel: aiService.getCurrentModel()
      });
    }

    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Check if it's the GITHUB_TOKEN error
    if (error.message && error.message.includes('GITHUB_TOKEN')) {
      return NextResponse.json(
        { 
          error: 'GITHUB_TOKEN environment variable is required',
          details: 'Please check your .env.local file and restart the development server',
          solution: '1. Create .env.local file in project root\n2. Add: GITHUB_TOKEN=your_token_here\n3. Restart: npm run dev'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
} 