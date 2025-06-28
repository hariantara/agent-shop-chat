'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white border-t px-3 py-2">
      <div className="flex-1 flex items-center">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="w-full h-11 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent text-gray-900 placeholder-gray-500 text-sm leading-[44px] p-0 px-4"
          rows={1}
          style={{ minHeight: '44px', maxHeight: '44px', overflowY: 'hidden' }}
          disabled={isLoading}
        />
      </div>
      
      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="flex-shrink-0 w-11 h-11 bg-whatsapp-green text-white rounded-full flex items-center justify-center hover:bg-whatsapp-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
} 