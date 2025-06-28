'use client';

import { useState } from 'react';
import { Store, CheckCircle, AlertCircle } from 'lucide-react';

interface StoreSetupProps {
  onStoreSet: (storeUrl: string) => void;
  currentStore?: string;
  onDisconnect?: () => void;
}

export default function StoreSetup({ onStoreSet, currentStore, onDisconnect }: StoreSetupProps) {
  const [storeUrl, setStoreUrl] = useState(currentStore || '');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const validateShopifyUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      // Check if it's a valid URL first
      return urlObj.hostname.length > 0;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!storeUrl.trim()) {
      setError('Please enter a store URL');
      return;
    }

    if (!validateShopifyUrl(storeUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    setIsValidating(true);
    
    try {
      // Normalize the URL
      let normalizedUrl = storeUrl.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }
      
      onStoreSet(normalizedUrl);
    } catch (err: any) {
      // Handle specific error messages from the API
      if (err.message && err.message.includes('not a Shopify store')) {
        setError('❌ This is not a Shopify store. Please provide a valid Shopify store URL.');
      } else if (err.message && err.message.includes('Unable to access')) {
        setError('❌ Unable to access this store. Please check if the URL is correct and the store is publicly accessible.');
      } else if (err.message && err.message.includes('Failed to connect')) {
        setError('❌ Failed to connect to this store. Please verify it\'s a valid Shopify store URL.');
      } else {
        setError('❌ Failed to connect to store. Please try again.');
      }
    } finally {
      setIsValidating(false);
    }
  };

  if (currentStore) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-green-800">Store Connected</h3>
            <p className="text-sm text-green-600 truncate">{currentStore}</p>
          </div>
        </div>
        {onDisconnect && (
          <button
            onClick={onDisconnect}
            className="ml-4 px-3 py-1 bg-white text-green-700 border border-green-300 rounded-full text-xs font-semibold hover:bg-red-100 hover:text-red-600 transition"
          >
            Disconnect
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Store className="w-6 h-6 text-blue-600 flex-shrink-0" />
        <h2 className="text-lg font-semibold text-blue-800">Connect Your Shopify Store</h2>
      </div>
      
      <p className="text-blue-700 mb-4 text-sm sm:text-base">
        Enter your <strong>Shopify store URL</strong> to get started. Our AI assistant will help your customers find products and answer questions about your store.
        <br /><br />
        <strong>⚠️ Important:</strong> Only Shopify stores are supported. Non-Shopify stores will not work.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="storeUrl" className="block text-sm font-medium text-blue-800 mb-2">
            Store URL
          </label>
          <input
            type="url"
            id="storeUrl"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            placeholder="e.g., mystore.myshopify.com"
            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm sm:text-base"
            disabled={isValidating}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isValidating || !storeUrl.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
        >
          {isValidating ? 'Connecting...' : 'Connect Store'}
        </button>
      </form>

      <div className="mt-4 text-xs text-blue-600">
        <p className="font-medium mb-1">Examples of Shopify store URLs:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>mystore.myshopify.com</li>
          <li>https://allbirds.com (Shopify store)</li>
          <li>https://kith.com (Shopify store)</li>
          <li>https://shop.mystore.com (custom domain)</li>
        </ul>
        <p className="mt-2 text-orange-600">
          💡 <strong>Tip:</strong> If you're not sure if a store uses Shopify, try adding "/products.json" to the URL. If it returns JSON data, it's a Shopify store!
        </p>
      </div>
    </div>
  );
} 