import React from 'react';
import type { Metadata } from 'next';
import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/ecommerce/layout/CartDrawer';
import { EcommerceFooter } from '@/components/ecommerce/layout/EcommerceFooter';
// import '@/styles/ecommerce-tokens.css';

export const metadata: Metadata = {
  title: 'Jayaram Mittai — Authentic Sweets, Savouries & Wholesome Delights Since 1978',
  description:
    'Order fresh pure ghee sweets, traditional South Indian savouries, tandoori starters, and cold-pressed juices from Jayaram Mittai with fast delivery across Chennai.',
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#f8f6f0] dark:bg-[#121214] text-[#1f2937] dark:text-[#f3f4f6] font-sans antialiased selection:bg-[#fe0000] selection:text-white">
        <main className="flex-1">
          {children}
        </main>
        <CartDrawer />
        <EcommerceFooter />
      </div>
    </CartProvider>
  );
}
