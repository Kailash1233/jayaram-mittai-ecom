'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — PRODUCT CARD
// Reference: Section 0 (Brand Patterns), Section 5, 6, 18 of "e commerce - master.md"
// =============================================================================

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Check, Clock, AlertCircle } from 'lucide-react';
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
    <div className="group relative flex flex-col justify-between rounded-3xl bg-[#fffdfa] dark:bg-[#1e1e24] border border-[#e8e4da] dark:border-[#2e2e38] overflow-hidden shadow-sm hover:shadow-md hover:border-[#fcd4d4] dark:hover:border-red-900/50 transition-all duration-300">
      {/* Product Image Container */}
      <div className="relative w-full h-44 sm:h-48 bg-[#f9f4ec] dark:bg-[#25252d] overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            !availability.isAvailable ? 'grayscale opacity-70' : ''
          }`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={() =>
            setImgSrc('/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg')
          }
        />

        {/* Brand Tag Badge */}
        {availability.isAvailable && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#fe0000] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
            {tagBadge}
          </span>
        )}

        {/* Out of Stock / Time Window Overlay Banner */}
        {!availability.isAvailable && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
            <div className="bg-white/95 dark:bg-gray-900/95 px-3 py-1.5 rounded-2xl shadow-lg border border-red-200">
              <span className="text-xs font-bold text-[#fe0000] flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {availability.customMessage || 'Unavailable'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="font-serif font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-[#fe0000] transition-colors">
              {product.name}
            </h3>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
            {product.description || 'Authentic traditional recipe prepared with fresh ingredients.'}
          </p>
        </div>

        {/* Bottom Pricing & Action Row */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-gray-400 block -mb-0.5">Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-extrabold text-[#fe0000]">
                ₹{product.price}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                / {product.unit}
              </span>
            </div>
          </div>

          {/* Add to Cart / Stepper */}
          <div>
            {!availability.isAvailable ? (
              <span className="text-xs font-bold text-gray-400 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full cursor-not-allowed">
                Sold Out
              </span>
            ) : quantity === 0 ? (
              <button
                onClick={(e) => {
                  addItem(product, 1);
                  if (onAdd) onAdd(product.name, e);
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-xs shadow-md shadow-red-500/25 transition-all hover:scale-105 active:scale-95"
                aria-label={`Add ${product.name} to cart`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-[#fff0f0] dark:bg-red-950/40 border border-[#fcd4d4] dark:border-red-900/50 px-2.5 py-1 rounded-full text-[#fe0000] font-bold shadow-sm">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="p-0.5 hover:bg-[#ffe6e6] dark:hover:bg-red-900/60 rounded-full transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-extrabold w-4 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="p-0.5 hover:bg-[#ffe6e6] dark:hover:bg-red-900/60 rounded-full transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
