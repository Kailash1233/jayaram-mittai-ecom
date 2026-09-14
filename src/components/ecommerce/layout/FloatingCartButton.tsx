'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — FLOATING QUICK CART BUTTON ON SCROLL
// =============================================================================

import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function FloatingCartButton() {
  const { itemCount, calculation, openDrawer, isDrawerOpen } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating cart when scrolled down past hero
      setIsVisible(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || isDrawerOpen || itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-6 duration-300">
      <button
        onClick={openDrawer}
        className="flex items-center gap-3 pl-4 pr-3 py-3 rounded-full bg-[#fe0000]/90 hover:bg-[#fe0000] text-white shadow-2xl shadow-red-500/40 backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 group"
        aria-label="View Cart"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-white text-[#fe0000] flex items-center justify-center font-bold text-xs shadow-sm">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="absolute -top-1.5 -right-1.5 bg-[#cc0000] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
            {itemCount}
          </span>
        </div>

        <div className="text-left">
          <span className="text-[10px] text-white/80 block uppercase font-bold tracking-wider leading-none">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="text-sm font-extrabold text-white leading-none">
            ₹{calculation.total.toFixed(0)}
          </span>
        </div>

        <div className="pl-1 pr-1 border-l border-white/20 flex items-center text-xs font-bold">
          <span className="hidden sm:inline">View Cart</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </button>
    </div>
  );
}
