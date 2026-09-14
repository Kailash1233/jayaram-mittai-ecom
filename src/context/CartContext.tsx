'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — SHOPPING CART CONTEXT
// Reference: Section 1, 4, 18 of "e commerce - master.md"
// =============================================================================

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { CartItem, JayaramMittaiProduct, CalculationResult, JayaramMittaiDeliveryZone } from '@/lib/ecommerce/types';
import { calculateCartTotals } from '@/lib/ecommerce/calculations';
import { SEED_DELIVERY_ZONES } from '@/lib/ecommerce/catalog-seed';

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
  selectedZone: JayaramMittaiDeliveryZone;
  setSelectedZone: (zone: JayaramMittaiDeliveryZone) => void;
  calculation: CalculationResult;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'jm_ecommerce_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<JayaramMittaiDeliveryZone>(
    SEED_DELIVERY_ZONES[0]
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Ignore parse error
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage error
    }
  }, [items, isLoaded]);

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
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const calculation = useMemo(() => {
    const distance = selectedZone ? selectedZone.radius_km : 4.0;
    return calculateCartTotals(items, distance);
  }, [items, selectedZone]);

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
        selectedZone,
        setSelectedZone,
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
