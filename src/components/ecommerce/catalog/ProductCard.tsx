'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — PRODUCT CARD
// Compact, grocery-app-style card: image with a floating Add button at the
// bottom-right corner (like Zepto's own cards), bold sans product name,
// price directly underneath. Brand color stays red.
// =============================================================================

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, AlertCircle } from 'lucide-react';
import { JayaramMittaiProduct } from '@/lib/ecommerce/types';
import { evaluateProductAvailability } from '@/lib/ecommerce/calculations';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: JayaramMittaiProduct;
  onAdd?: (productName: string, event: React.MouseEvent) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const [imgSrc, setImgSrc] = useState(
    product.image_url || '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg'
  );

  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const availability = evaluateProductAvailability(product);

  // Badge label logic
  const tagBadge =
    product.price > 500
      ? 'Festive Pack'
      : product.category_id === 'cat-sweets'
      ? 'Pure Ghee'
      : product.category_id === 'cat-tikkas'
      ? 'Tandoor Fresh'
      : 'Popular';

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#1e1e24] border border-gray-100 dark:border-[#2e2e38] overflow-hidden hover:shadow-md hover:border-gray-200 dark:hover:border-red-900/50 transition-all duration-200">
      {/* Image + floating Add button share this positioning context. The button is a
          SIBLING of the Link (not nested inside it) so it's never an <a><button> pair. */}
      <div className="relative w-full aspect-square bg-[#f9f4ec] dark:bg-[#25252d] overflow-hidden">
        <Link href={`/shop/product/${product.id}`} className="block w-full h-full">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
              !availability.isAvailable ? 'grayscale opacity-70' : ''
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() =>
              setImgSrc('/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg')
            }
          />

          {availability.isAvailable && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wide">
              {tagBadge}
            </span>
          )}

          {!availability.isAvailable && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
              <div className="bg-white/95 dark:bg-gray-900/95 px-3 py-1.5 rounded-xl shadow-lg border border-red-200">
                <span className="text-[11px] font-bold text-[#fe0000] flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {availability.customMessage || 'Unavailable'}
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Floating Add button / stepper, overlapping the image's bottom-right corner */}
        {availability.isAvailable && quantity === 0 && (
          <button
            onClick={(e) => {
              addItem(product, 1);
              if (onAdd) onAdd(product.name, e);
            }}
            className="absolute bottom-0 right-2 translate-y-1/2 px-4 py-1.5 rounded-lg bg-white dark:bg-[#1e1e24] text-[#fe0000] font-extrabold text-xs border border-[#fe0000]/30 shadow-md hover:bg-[#fff5f5] transition-colors"
            aria-label={`Add ${product.name} to cart`}
          >
            ADD
          </button>
        )}
        {availability.isAvailable && quantity > 0 && (
          <div className="absolute bottom-0 right-2 translate-y-1/2 flex items-center gap-2 bg-[#fe0000] px-2 py-1 rounded-lg text-white font-bold shadow-md">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="p-0.5 hover:bg-white/20 rounded transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-extrabold w-3 text-center">{quantity}</span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="p-0.5 hover:bg-white/20 rounded transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <Link href={`/shop/product/${product.id}`} className="block px-3 pt-4 pb-3">
        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-[#fe0000] transition-colors">
          {product.name}
        </h3>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">
          {product.unit || 'Pack'}
        </p>
        <div className="flex items-baseline gap-1 mt-1.5">
          <span className="text-sm font-extrabold text-gray-900 dark:text-white">₹{product.price}</span>
        </div>
      </Link>

      {!availability.isAvailable && (
        <div className="px-3 pb-3">
          <span className="inline-block text-[11px] font-bold text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md cursor-not-allowed">
            Sold Out
          </span>
        </div>
      )}
    </div>
  );
}
