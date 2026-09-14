'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — FLYING TO CART ANIMATION & TOAST
// =============================================================================

import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

export interface FlyingItem {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  text: string;
}

export function useFlyingCart() {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerFly = (name: string, event: React.MouseEvent) => {
    // 1. Get click position
    const startX = event.clientX;
    const startY = event.clientY;

    // 2. Get Nav Cart button coordinates
    const cartBtn = document.getElementById('cart-nav-button');
    let endX = window.innerWidth - 60;
    let endY = 35;

    if (cartBtn) {
      const rect = cartBtn.getBoundingClientRect();
      endX = rect.left + rect.width / 2;
      endY = rect.top + rect.height / 2;
    }

    const newItem: FlyingItem = {
      id: Date.now() + Math.random(),
      startX,
      startY,
      endX,
      endY,
      text: name,
    };

    setFlyingItems((prev) => [...prev, newItem]);

    // Toast message
    setToastMessage(`Added "${name}" to cart ✨`);

    // Remove flying particle after animation completes
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== newItem.id));
      // Bounce the cart icon
      const badge = document.getElementById('cart-badge-counter');
      if (badge) {
        badge.classList.remove('animate-bounce');
        void badge.offsetWidth;
        badge.classList.add('animate-bounce');
      }
    }, 700);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
    return () => clearInterval(timer);
  }, [toastMessage]);

  return { triggerFly, flyingItems, toastMessage };
}

export function FlyingCartOverlay({
  flyingItems,
  toastMessage,
}: {
  flyingItems: FlyingItem[];
  toastMessage: string | null;
}) {
  return (
    <>
      {/* Flying particles */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {flyingItems.map((item) => (
          <div
            key={item.id}
            className="absolute transition-all duration-700 ease-in-out flex items-center justify-center"
            style={{
              left: `${item.startX}px`,
              top: `${item.startY}px`,
              animation: `flyToCartKeyframes 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
              ['--end-x' as any]: `${item.endX - item.startX}px`,
              ['--end-y' as any]: `${item.endY - item.startY}px`,
            }}
          >
            <div className="w-8 h-8 rounded-full bg-[#fe0000] text-white flex items-center justify-center shadow-lg shadow-red-500/50 scale-100">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-gray-900/95 text-white dark:bg-white dark:text-gray-900 px-6 py-3 rounded-full text-xs font-bold shadow-2xl border border-white/20 flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#76e000] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Embedded CSS for keyframes */}
      <style jsx global>{`
        @keyframes flyToCartKeyframes {
          0% {
            transform: translate(0, 0) scale(1.2);
            opacity: 1;
          }
          60% {
            transform: translate(calc(var(--end-x) * 0.7), calc(var(--end-y) * 0.4 - 40px)) scale(1);
            opacity: 0.95;
          }
          100% {
            transform: translate(var(--end-x), var(--end-y)) scale(0.25);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
