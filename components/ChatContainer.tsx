'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import StoreSetup from './StoreSetup';
import { MessageCircle, Loader2, Store, Send, Plus, X, BarChart3 } from 'lucide-react';
import { getAIService } from '../lib/ai-service';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

const initialWelcomeMessage: Message = {
  id: '1',
  content: "Hi there! 👋 I'm your AI shopping assistant. I'm here to help your customers find exactly what they're looking for in your store. First, let's connect your Shopify store so I can learn about your products and help customers better!",
  isUser: false,
  timestamp: new Date().toISOString()
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 h-5">
      <span className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
      <span className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
      <span className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
    </div>
  );
}

function extractFinalReply(aiResponse: string): string {
  const thinkEnd = aiResponse.indexOf('</think>');
  if (thinkEnd !== -1) {
    return aiResponse.slice(thinkEnd + 8).trim();
  }
  return aiResponse.trim();
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([initialWelcomeMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStore, setCurrentStore] = useState<string>('');
  const [showStoreSetup, setShowStoreSetup] = useState(false);
  const [showUsageStatus, setShowUsageStatus] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>('Loading...');
  const [usageStatus, setUsageStatus] = useState<string>('Loading usage status...');
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    // Get current model from API after component mounts on client
    const getCurrentModel = async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'listModels'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.currentModel) {
            setCurrentModel(data.currentModel);
          }
        }
      } catch (error) {
        console.warn('Failed to get current model:', error);
        setCurrentModel('Unknown');
      }
    };

    getCurrentModel();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStoreSet = async (storeUrl: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'setStore',
          storeUrl: storeUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect store');
      }

      const data = await response.json();
      setCurrentStore(storeUrl);
      
      // Update current model from API response
      if (data.currentModel) {
        setCurrentModel(data.currentModel);
      }
      
      // Add success message
      const successMessage: Message = {
        id: Date.now().toString(),
        content: data.message,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, successMessage]);
      
      // Add a follow-up message to encourage conversation
      const followUpMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Perfect! 🎉 I'm now connected to your store and ready to help customers. They can ask me about products, get recommendations, or ask any questions about your store. What would you like to test first?",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, followUpMessage]);
      }, 1000);
      
    } catch (error) {
      console.error('Error setting store:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Sorry, I couldn't connect to your store right now. Please check the URL and try again.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectStore = () => {
    setCurrentStore('');
    setMessages([{
      ...initialWelcomeMessage,
      timestamp: new Date().toISOString()
    }]);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.isUser ? 'user' as const : 'assistant' as const,
              content: msg.content
            })),
            { role: 'user', content: content.trim() }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      
      // Update current model from API response
      if (data.currentModel) {
        setCurrentModel(data.currentModel);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        isUser: false,
        timestamp: data.timestamp || new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsageStatusToggle = () => {
    const newShowStatus = !showUsageStatus;
    setShowUsageStatus(newShowStatus);
    
    // Load usage status when opening the panel
    if (newShowStatus) {
      loadUsageStatus();
    }
  };

  const getUsageStatus = () => {
    return usageStatus;
  };

  const loadUsageStatus = async () => {
    if (!isClient) return;
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getUsageStatus'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsageStatus(data.usageStatus || 'Unable to load usage status');
      } else {
        setUsageStatus('Unable to load usage status');
      }
    } catch (error) {
      setUsageStatus('Unable to load usage status');
    }
  };

  const handleVerifyTokenAccess = async () => {
    if (!isClient) return;
    setIsVerifying(true);
    setVerificationResult('');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verifyToken'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      const data = await response.json();
      setVerificationResult(data.summary || '✅ Token verification successful');
    } catch (error) {
      setVerificationResult(`❌ Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5]">
      {/* Header */}
      <div className="bg-[#25D366] text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#25D366] font-bold text-lg">🛍️</span>
            </div>
            <div>
              <h1 className="font-semibold text-lg">AI Shop Assistant</h1>
              <p className="text-sm opacity-90">
                {currentStore ? `Connected to ${currentStore}` : 'Ready to help you shop'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Usage Status Button */}
            <button
              onClick={handleUsageStatusToggle}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="View model usage status"
            >
              <BarChart3 size={20} />
            </button>
            {/* Store Setup Button */}
            <button
              onClick={() => setShowStoreSetup(!showStoreSetup)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title={currentStore ? "Disconnect store" : "Connect store"}
            >
              {currentStore ? <X size={20} /> : <Plus size={20} />}
            </button>
          </div>
        </div>
        
        {/* Current Model Info */}
        <div className="mt-2 text-xs opacity-75">
          Current Model: {isClient ? currentModel : 'Loading...'}
        </div>
      </div>

      {/* Usage Status Panel */}
      {showUsageStatus && (
        <div className="bg-white border-b border-gray-200 p-4 max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Model Usage Status</h3>
            <button
              onClick={() => setShowUsageStatus(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Token Verification Section */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">🔑 Token Access Verification</h4>
              <button
                onClick={handleVerifyTokenAccess}
                disabled={isVerifying}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isVerifying ? 'Verifying...' : 'Test Access'}
              </button>
            </div>
            {verificationResult && (
              <div className="text-xs text-gray-600 whitespace-pre-line font-mono bg-white p-2 rounded border">
                {verificationResult}
              </div>
            )}
            {!verificationResult && !isVerifying && (
              <p className="text-xs text-gray-500">
                Click "Test Access" to verify your GitHub token can access all configured models
              </p>
            )}
          </div>
          
          <div className="text-sm text-gray-600 whitespace-pre-line">
            {getUsageStatus()}
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> The system automatically switches between models when rate limits are reached, 
              maximizing your daily quota of <strong>380+ requests</strong> across all models!
            </p>
          </div>
        </div>
      )}

             {/* Store Setup Panel */}
       {showStoreSetup && (
         <div className="bg-white border-b border-gray-200 p-4">
           <div className="flex items-center justify-between mb-3">
             <h3 className="font-semibold text-gray-800">Store Setup</h3>
             <button
               onClick={() => setShowStoreSetup(false)}
               className="text-gray-500 hover:text-gray-700"
             >
               <X size={16} />
             </button>
           </div>
           <StoreSetup
             onStoreSet={handleStoreSet}
             currentStore={currentStore}
             onDisconnect={handleDisconnectStore}
           />
         </div>
       )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-4">🛍️</div>
            <h2 className="text-xl font-semibold mb-2">Welcome to AI Shop Assistant!</h2>
            <p className="text-sm mb-4">
              {currentStore 
                ? `I'm ready to help you find products from ${currentStore}. What are you looking for?`
                : 'Connect your Shopify store to get started, or ask me anything about shopping!'
              }
            </p>
            <div className="bg-white/50 rounded-lg p-4 text-xs">
              <p className="font-medium mb-2">🚀 Multiple Models Strategy Active</p>
              <p>Automatically switches between 5 different AI models for maximum daily quota!</p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage key={message.id} content={message.content} isUser={message.isUser} timestamp={message.timestamp} />
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-whatsapp-green rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white px-4 py-2 rounded-lg rounded-bl-md shadow-sm">
              <TypingIndicator />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
} 