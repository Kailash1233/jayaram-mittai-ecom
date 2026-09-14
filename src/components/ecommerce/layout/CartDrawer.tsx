'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — SLIDE-IN CART DRAWER
// Reference: Section 0 (Brand Patterns), Section 4 (Delivery Rules), Section 18
// =============================================================================

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { SEED_DELIVERY_ZONES } from '@/lib/ecommerce/catalog-seed';

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    clearCart,
    calculation,
    selectedZone,
    setSelectedZone,
  } = useCart();

  if (!isDrawerOpen) return null;

  const freeDeliveryProgress = Math.min(
    100,
    Math.round((calculation.subtotal / calculation.freeDeliveryThreshold) * 100)
  );

  const amountNeededForFreeDelivery = Math.max(
    0,
    calculation.freeDeliveryThreshold - calculation.subtotal
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fffdfa] dark:bg-[#1e1e24] text-gray-900 dark:text-gray-100 shadow-2xl flex flex-col">
          {/* Header in Solid Brand Red */}
          <div className="bg-[#fe0000] text-white px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-white" />
              <h2 className="font-serif font-bold text-lg text-white">Your Cart</h2>
              <span className="text-xs bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all items from your cart?')) {
                      clearCart();
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all"
                  title="Clear all items in cart"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cart</span>
                </button>
              )}
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Delivery Bar Banner */}
          <div className="bg-[#fff0f0] dark:bg-[#25252d] border-b border-[#fcd4d4] dark:border-[#2e2e38] px-6 py-3">
            {calculation.isFreeDelivery ? (
              <div className="flex items-center gap-2 text-xs font-bold text-[#76e000] dark:text-[#76e000]">
                <span>🎉</span>
                <span>You have unlocked FREE Delivery!</span>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Add <span className="text-[#fe0000] font-bold">₹{amountNeededForFreeDelivery.toFixed(0)}</span> more for <span className="font-bold text-[#fe0000]">FREE Delivery</span>
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#fe0000] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-12">
                <div className="w-16 h-16 rounded-full bg-[#fff0f0] dark:bg-[#25252d] flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-[#fe0000]" />
                </div>
                <h3 className="font-serif font-bold text-lg text-gray-800 dark:text-gray-200 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mb-6">
                  Explore our handcrafted sweets, savouries, and fresh beverages to get started.
                </p>
                <button
                  onClick={closeDrawer}
                  className="px-6 py-2.5 rounded-full bg-[#fe0000] text-white text-sm font-bold shadow-md hover:bg-[#cc0000] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#f9f4ec] dark:bg-[#25252d] border border-[#e8e4da] dark:border-[#2e2e38] transition-shadow hover:shadow-sm"
                  >
                    {/* Item Image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-100 dark:border-gray-800">
                      <Image
                        src={product.image_url || '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ₹{product.price} / {product.unit}
                      </p>
                      <p className="text-xs font-bold text-[#fe0000] mt-0.5">
                        ₹{(product.price * quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-[#1e1e24] px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1 hover:text-[#fe0000] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        {quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-gray-400" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-xs font-bold w-4 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1 hover:text-[#fe0000] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Trigger */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={clearCart}
                    className="text-xs text-gray-400 hover:text-[#fe0000] transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="border-t border-[#e8e4da] dark:border-[#2e2e38] bg-[#fcfbfa] dark:bg-[#1a1a1e] p-6 space-y-4 shadow-lg">
              {/* Delivery Zone Selector */}
              <div className="flex items-center justify-between text-xs bg-white dark:bg-[#25252d] p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-[#fe0000]" />
                  <span>Deliver To:</span>
                </div>
                <select
                  value={selectedZone.id}
                  onChange={(e) => {
                    const zone = SEED_DELIVERY_ZONES.find((z) => z.id === e.target.value);
                    if (zone) setSelectedZone(zone);
                  }}
                  className="bg-transparent font-bold text-gray-900 dark:text-gray-100 focus:outline-none cursor-pointer"
                >
                  {SEED_DELIVERY_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id} className="dark:bg-gray-800">
                      {zone.name} (~{zone.radius_km} km)
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    ₹{calculation.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    Delivery Charge ({calculation.distanceKm} km)
                  </span>
                  <span className={calculation.isFreeDelivery ? 'font-bold text-[#76e000]' : 'font-semibold text-gray-900 dark:text-gray-100'}>
                    {calculation.isFreeDelivery ? 'FREE' : `₹${calculation.deliveryCharge.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" /> Est. Delivery Time
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    ~{calculation.estimatedHours} Hours
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-sm font-bold text-gray-900 dark:text-gray-100">
                  <span>Total Amount</span>
                  <span className="text-[#fe0000] text-base">
                    ₹{calculation.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/shop/checkout"
                onClick={closeDrawer}
                className="w-full py-3.5 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#76e000]" />
                <span>100% Vegetarian • Freshly Prepared • Secure Payment</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
