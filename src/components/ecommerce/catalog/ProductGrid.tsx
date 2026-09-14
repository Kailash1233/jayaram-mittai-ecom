'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — PRODUCT GRID
// Reference: Section 15 (Performance), Section 18 of "e commerce - master.md"
// =============================================================================

import React from 'react';
import { JayaramMittaiProduct } from '@/lib/ecommerce/types';
import { ProductCard } from './ProductCard';
import { ShoppingBag, SearchX } from 'lucide-react';

interface ProductGridProps {
  products: JayaramMittaiProduct[];
  isLoading?: boolean;
  onClearFilter?: () => void;
  onAdd?: (productName: string, event: React.MouseEvent) => void;
}

export function ProductGrid({ products, isLoading = false, onClearFilter, onAdd }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-white dark:bg-[#1e1e24] border border-gray-100 dark:border-gray-800 p-4 space-y-3 animate-pulse"
          >
            <div className="w-full h-44 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md w-full" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-16" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#fff0f0] dark:bg-red-950/40 mx-auto flex items-center justify-center text-[#fe0000]">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-gray-100">
          No specialties found
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          We could not find any items matching your search or category filter. Try looking for our popular Sweets, Tikkas, or Juices.
        </p>
        {onClearFilter && (
          <button
            onClick={onClearFilter}
            className="px-6 py-2.5 rounded-full bg-[#fe0000] text-white text-xs font-bold shadow-md hover:bg-[#cc0000] transition-colors"
          >
            Show All Menu Items
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  );
}
