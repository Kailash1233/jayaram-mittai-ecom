'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — SHOPPING CART CONTEXT
// Delivery zone is now resolved from the customer's pincode against the real
// GET /api/deliveryzones list (zones are pincode-based, not radius/lat-lng).
// =============================================================================

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { CartItem, JayaramMittaiProduct } from '@/lib/ecommerce/types';
import { calculateCartTotals, CalculationResult } from '@/lib/ecommerce/calculations';
import { getDeliveryZones, matchZoneByPincode } from '@/lib/api/deliveryZones';
import type { ShopApiDeliveryZone } from '@/lib/api/shopTypes';

interface CartContextType {
  items: CartItem[];
  addItem: (product: JayaramMittaiProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  /** All delivery zones the shop currently serves. */
  zones: ShopApiDeliveryZone[];
  /** The pincode the customer last entered (checkout or the mini zone-check widget). */
  pincode: string;
  setPincode: (pincode: string) => void;
  /** The zone matching `pincode`, or null if nothing serves it (or none entered yet). */
  matchedZone: ShopApiDeliveryZone | null;
  calculation: CalculationResult;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'jm_ecommerce_cart_v1';
const PINCODE_STORAGE_KEY = 'jm_ecommerce_pincode_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [zones, setZones] = useState<ShopApiDeliveryZone[]>([]);
  const [pincode, setPincodeState] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart + last-used pincode from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) setItems(JSON.parse(storedCart));
      const storedPincode = localStorage.getItem(PINCODE_STORAGE_KEY);
      if (storedPincode) setPincodeState(storedPincode);
    } catch {
      // Ignore parse error
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Fetch the zone list once
  useEffect(() => {
    getDeliveryZones()
      .then(setZones)
      .catch(() => setZones([]));
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage error
    }
  }, [items, isLoaded]);

  const setPincode = useCallback((next: string) => {
    setPincodeState(next);
    try {
      if (next) {
        localStorage.setItem(PINCODE_STORAGE_KEY, next);
      } else {
        localStorage.removeItem(PINCODE_STORAGE_KEY);
      }
    } catch {
      // Storage error
    }
  }, []);

  const addItem = useCallback((product: JayaramMittaiProduct, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    // Do NOT open drawer automatically on add — drawer opens only when user clicks cart icon
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const matchedZone = useMemo(
    () => (pincode && zones.length ? matchZoneByPincode(zones, pincode) : null),
    [pincode, zones]
  );

  const calculation = useMemo(() => calculateCartTotals(items, matchedZone), [items, matchedZone]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        zones,
        pincode,
        setPincode,
        matchedZone,
        calculation,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
