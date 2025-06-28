import React from 'react';

interface ProductCardProps {
  name: string;
  image?: string;
  description: string;
  url?: string;
  salePrice?: string;
  actualPrice?: string;
  category?: string;
}

function formatPrice(price?: string): string {
  if (!price || price === '') return '';
  
  // Convert string to number
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return price;
  
  // If price is very large (like 2674000), assume it's IDR and convert to USD
  let finalPrice = numPrice;
  if (numPrice > 50000) {
    // Approximate IDR to USD conversion (1 USD ≈ 15,000-16,000 IDR)
    // Using 15,500 as average exchange rate
    finalPrice = numPrice / 15500;
  }
  
  // Format as USD currency
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(finalPrice);
}

export default function ProductCard({ name, image, description, url, salePrice, actualPrice, category }: ProductCardProps) {
  const hasImage = image && image.trim() !== '';
  
  return (
    <a
      href={url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-row w-full rounded-lg border bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden p-2 h-full"
      style={{ textDecoration: 'none' }}
    >
      {/* Image on the left */}
      <div className="flex-shrink-0 w-16 h-16 mr-3">
        {hasImage ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain rounded bg-gray-100"
            onError={e => { 
              console.log('Image failed to load:', image);
              (e.target as HTMLImageElement).style.display = 'none'; 
            }}
            onLoad={() => console.log('Image loaded successfully:', image)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded">
            No Image
          </div>
        )}
      </div>
      
      {/* Content on the right */}
      <div className="flex-1 flex flex-col min-w-0">
        <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-2 leading-tight">{name}</h3>
        
        {category && (
          <div className="text-xs text-gray-500 mb-1">
            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{category}</span>
          </div>
        )}
        
        <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-tight flex-1">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {salePrice && salePrice !== actualPrice ? (
              <>
                <span className="text-red-600 font-bold text-sm">{formatPrice(salePrice)}</span>
                <span className="text-gray-400 line-through text-xs">{formatPrice(actualPrice)}</span>
              </>
            ) : (
              <span className="text-gray-900 font-semibold text-sm">{formatPrice(actualPrice)}</span>
            )}
          </div>
          
          {url && (
            <button className="px-2 py-1 text-xs font-medium bg-whatsapp-green text-white rounded hover:bg-whatsapp-dark transition-colors">
              View
            </button>
          )}
        </div>
      </div>
    </a>
  );
} 