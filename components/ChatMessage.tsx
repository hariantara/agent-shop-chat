'use client';

import { cn } from '@/lib/utils';
import { MessageCircle, User } from 'lucide-react';
import ProductCard from './ProductCard';
import { useEffect, useState } from 'react';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: string;
}

function extractProducts(content: string) {
  console.log('Raw AI content:', JSON.stringify(content));
  
  // Remove code block markers if present and normalize whitespace
  const cleaned = content.replace(/```json|```/g, '').replace(/\n\s*/g, '\n').trim();
  console.log('Cleaned content:', JSON.stringify(cleaned));
  
  // Find the first JSON block anywhere in the message
  let start = cleaned.indexOf('{');
  if (start === -1) {
    console.log('No { found');
    return { products: null, rest: content };
  }
  
  let braceCount = 0;
  let end = -1;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === '{') braceCount++;
    if (cleaned[i] === '}') braceCount--;
    if (braceCount === 0) {
      end = i + 1;
      break;
    }
  }
  
  if (end !== -1) {
    const jsonBlock = cleaned.slice(start, end);
    console.log('Extracted JSON block:', jsonBlock);
    try {
      const json = JSON.parse(jsonBlock);
      console.log('Parsed JSON:', json);
      if (json.products && Array.isArray(json.products)) {
        // Only show the text after the JSON block, never the JSON itself
        const rest = cleaned.slice(end).trim();
        console.log('Rest content:', rest);
        return { products: json.products, rest: rest };
      }
    } catch (e) {
      console.log('JSON parse error:', e);
    }
  }
  
  console.log('No valid products found, returning original content');
  return { products: null, rest: content };
}

export default function ChatMessage({ content, isUser, timestamp }: ChatMessageProps) {
  const { products, rest } = extractProducts(content);

  // Hydration-safe time rendering
  const [localTime, setLocalTime] = useState('');
  useEffect(() => {
    setLocalTime(
      new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }, [timestamp]);

  return (
    <div className={cn(
      "flex items-start gap-3 mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-whatsapp-green rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[70%] px-4 py-2 rounded-lg break-words",
        isUser 
          ? "bg-whatsapp-green text-white rounded-br-md" 
          : "bg-white text-gray-800 rounded-bl-md shadow-sm"
      )}>
        {products && (
          <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from(new Map(products
              .map((p: any) => [p.url || (p.name + (p.category || "")), p])
            ).values()).map((p: any) => (
              <ProductCard
                key={p.url || p.name + (p.category || "")}
                name={p.name}
                image={p.image}
                description={p.description}
                url={p.url}
                salePrice={p.salePrice}
                actualPrice={p.actualPrice}
                category={p.category}
              />
            ))}
          </div>
        )}
        {rest && (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{rest}</p>
        )}
        <p className={cn(
          "text-xs mt-1 opacity-70",
          isUser ? "text-right" : "text-left"
        )}>
          {localTime}
        </p>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </div>
  );
} 