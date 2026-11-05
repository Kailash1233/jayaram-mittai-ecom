'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — CHECKOUT PAGE
// Creates the order via POST /api/orders/create, then opens Razorpay
// Checkout with the backend-returned payment block and verifies the result
// via POST /api/payments/razorpay/verify. Amounts/signatures are never
// computed client-side — the backend is the sole authority.
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  CreditCard,
  Smartphone,
  Building,
  UtensilsCrossed,
  Clock,
  AlertTriangle,
  ChevronDown,
  LogIn,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { JayaramMittaiPaymentMethod } from '@/lib/ecommerce/types';
import { createOrder, verifyRazorpayPayment } from '@/lib/api/orders';
import { toE164 } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import type { RazorpayCheckoutSuccessResponse } from '@/lib/api/shopTypes';

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, calculation, clearCart, pincode, setPincode, matchedZone } = useCart();
  const { isAuthenticated, session, openAuthModal } = useAuth();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('Chennai');
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment State (Display priority strictly per the payment-methods spec)
  const [paymentMethod, setPaymentMethod] = useState<JayaramMittaiPaymentMethod>('upi');
  const [isSodexoExpanded, setIsSodexoExpanded] = useState(false);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // A fresh idempotency key per checkout attempt; the docs say re-use it on retry,
  // which this does automatically since it only regenerates on mount.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Prefill the phone field once we know who's signed in (still editable —
  // the order's contact number doesn't have to match the login number).
  useEffect(() => {
    if (session?.user.phone && !phone) {
      setPhone(session.user.phone.replace(/\D/g, '').slice(-10));
    }
  }, [session, phone]);

  const razorpayMethodPrefill = useCallback((method: JayaramMittaiPaymentMethod) => {
    switch (method) {
      case 'debit_card':
      case 'credit_card':
        return { card: true };
      case 'upi':
        return { upi: true };
      case 'net_banking':
        return { netbanking: true };
      case 'sodexo':
        return { wallet: true };
      default:
        return undefined;
    }
  }, []);

  const openRazorpayCheckout = useCallback(
    async (orderNumber: string, orderId: string, payment: { keyId: string; razorpayOrderId: string; amount: number; currency: string }) => {
      const loaded = await loadRazorpayScript();
      if (!loaded || !(window as any).Razorpay) {
        setErrorMessage('Could not load the payment window. Please check your connection and retry.');
        setIsSubmitting(false);
        return;
      }

      const checkout = new (window as any).Razorpay({
        key: payment.keyId,
        order_id: payment.razorpayOrderId,
        amount: payment.amount,
        currency: payment.currency,
        name: 'Jayaram Mittai',
        description: orderNumber,
        prefill: { name: fullName, contact: phone },
        method: razorpayMethodPrefill(paymentMethod),
        handler: async (response: RazorpayCheckoutSuccessResponse) => {
          try {
            const verifiedOrder = await verifyRazorpayPayment(response);
            try {
              sessionStorage.setItem(`jm_order_${verifiedOrder.id}`, JSON.stringify(verifiedOrder));
            } catch {}
            clearCart();
            router.push(`/shop/orders/${verifiedOrder.id}`);
          } catch (err) {
            setErrorMessage(
              err instanceof ApiError
                ? err.message
                : 'Payment was received but could not be confirmed. Please check Your Orders, or contact us.'
            );
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setErrorMessage('Payment was not completed. Your order is saved — you can pay again below.');
            setIsSubmitting(false);
          },
        },
      });

      checkout.on('payment.failed', (resp: any) => {
        setErrorMessage(resp?.error?.description || 'Payment failed. Please try again.');
        setIsSubmitting(false);
      });

      checkout.open();
    },
    [fullName, phone, paymentMethod, razorpayMethodPrefill, clearCart, router]
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (!fullName.trim() || !phone.trim() || !line1.trim() || pincode.length !== 6) {
      setErrorMessage('Please complete all required contact and delivery address fields.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before checking out.');
      return;
    }

    if (!matchedZone) {
      setErrorMessage(`Sorry, we don't deliver to pincode "${pincode}" yet.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const { order, payment } = await createOrder({
        customer: { fullName: fullName.trim(), phone: toE164(phone) },
        address: {
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          city: city.trim(),
          pincode,
        },
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        idempotencyKey,
        customerNotes: customerNotes.trim() || undefined,
      });

      try {
        sessionStorage.setItem(`jm_order_${order.id}`, JSON.stringify(order));
      } catch {}

      if (!payment) {
        // Already paid (e.g. a retried idempotent request) — go straight to confirmation.
        clearCart();
        router.push(`/shop/orders/${order.id}`);
        return;
      }

      await openRazorpayCheckout(order.order_number, order.id, payment);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Failed to place order. Please retry.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif font-bold text-2xl">Your cart is empty</h2>
        <p className="text-sm text-gray-500">Add sweets or snacks from our menu before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-block px-7 py-3 rounded-full bg-[#fe0000] text-white font-bold text-sm shadow-md hover:bg-[#cc0000] transition-colors"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-[#fe0000] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>
      </div>

      {!isAuthenticated && (
        <div className="mb-6 p-4 rounded-2xl bg-[#fff0f0] dark:bg-red-950/30 border border-[#fcd4d4] dark:border-red-900/50 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
            Sign in with your mobile number to place an order.
          </p>
          <button
            onClick={openAuthModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-xs shadow-sm transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Form Details */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">
          {/* Section 1: Customer Contact Info */}
          <div className="bg-[#fffdfa] dark:bg-[#1e1e24] p-6 sm:p-7 rounded-3xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#fe0000] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl bg-[#f8f6f0] dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] focus:outline-none focus:ring-2 focus:ring-[#fe0000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number (for delivery updates) *
                </label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="e.g. 9840012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full p-3 text-sm rounded-xl bg-[#f8f6f0] dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] focus:outline-none focus:ring-2 focus:ring-[#fe0000]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Location & Address */}
          <div className="bg-[#fffdfa] dark:bg-[#1e1e24] p-6 sm:p-7 rounded-3xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#fe0000] text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span>Delivery Address</span>
            </h3>

            {/* Pincode & Zone Match */}
            <div className="bg-[#fff0f0] dark:bg-red-950/30 p-4 rounded-2xl border border-[#fcd4d4] dark:border-red-900/50 space-y-1.5">
              <label className="block text-xs font-bold text-[#fe0000] mb-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Delivery Pincode *
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                placeholder="600043"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full p-3 text-sm font-bold rounded-xl bg-white dark:bg-gray-900 border border-[#fcd4d4] dark:border-red-900/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#fe0000]"
              />
              {pincode.length === 6 && (
                matchedZone ? (
                  <p className="text-xs font-semibold text-[#0f7a42]">
                    Delivers to {matchedZone.location_name} — ₹{matchedZone.delivery_charge} delivery, free above ₹{matchedZone.free_delivery}
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-[#fe0000]">
                    Sorry, we don't deliver to this pincode yet.
                  </p>
                )
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Flat / House No., Building Name, Street *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 3B, Jayaram Apartments, 4th Main Road"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl bg-[#f8f6f0] dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] focus:outline-none focus:ring-2 focus:ring-[#fe0000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Landmark (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Near SBI ATM"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    className="w-full p-3 text-sm rounded-xl bg-[#f8f6f0] dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] focus:outline-none focus:ring-2 focus:ring-[#fe0000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 text-sm rounded-xl bg-[#f8f6f0] dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] focus:outline-none focus:ring-2 focus:ring-[#fe0000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Delivery Instructions (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave at security gate, ring bell"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl bg-[#f8f6f0] dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] focus:outline-none focus:ring-2 focus:ring-[#fe0000]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method (Display priority strictly per the spec) */}
          <div className="bg-[#fffdfa] dark:bg-[#1e1e24] p-6 sm:p-7 rounded-3xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#fe0000] text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span>Payment Option</span>
            </h3>
            <p className="text-[11px] text-gray-500 -mt-2">
              Choose your preferred method below — you'll confirm it securely in the payment window.
            </p>

            {/* Strict Display Priority: 1. Debit, 2. Credit, 3. UPI, 4. Net Banking, 5. Sodexo */}
            <div className="space-y-3">
              {/* 1. Debit Card */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'debit_card'
                    ? 'border-[#fe0000] bg-[#fff0f0] dark:bg-red-950/30'
                    : 'border-[#e8e4da] dark:border-[#2e2e38] hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="debit_card"
                    checked={paymentMethod === 'debit_card'}
                    onChange={() => setPaymentMethod('debit_card')}
                    className="accent-[#fe0000] w-4 h-4"
                  />
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#fe0000]" />
                    <span className="text-sm font-bold">1. Debit Card</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Visa, Mastercard, RuPay</span>
              </label>

              {/* 2. Credit Card */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'border-[#fe0000] bg-[#fff0f0] dark:bg-red-950/30'
                    : 'border-[#e8e4da] dark:border-[#2e2e38] hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => setPaymentMethod('credit_card')}
                    className="accent-[#fe0000] w-4 h-4"
                  />
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#fe0000]" />
                    <span className="text-sm font-bold">2. Credit Card</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">All Major Cards</span>
              </label>

              {/* 3. UPI */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-[#fe0000] bg-[#fff0f0] dark:bg-red-950/30'
                    : 'border-[#e8e4da] dark:border-[#2e2e38] hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="accent-[#fe0000] w-4 h-4"
                  />
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#fe0000]" />
                    <span className="text-sm font-bold">3. UPI Instant Pay</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#0f7a42] bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Fastest
                </span>
              </label>

              {/* 4. Net Banking */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'net_banking'
                    ? 'border-[#fe0000] bg-[#fff0f0] dark:bg-red-950/30'
                    : 'border-[#e8e4da] dark:border-[#2e2e38] hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="net_banking"
                    checked={paymentMethod === 'net_banking'}
                    onChange={() => setPaymentMethod('net_banking')}
                    className="accent-[#fe0000] w-4 h-4"
                  />
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#fe0000]" />
                    <span className="text-sm font-bold">4. Net Banking</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">50+ Banks</span>
              </label>

              {/* 5. Sodexo (Displayed last, expandable) */}
              <div className="border border-[#e8e4da] dark:border-[#2e2e38] rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsSodexoExpanded(!isSodexoExpanded)}
                  className="w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      5. Meal Pass / Sodexo (Expand)
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isSodexoExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isSodexoExpanded && (
                  <div className="p-4 bg-white dark:bg-[#1e1e24] border-t border-gray-100 dark:border-gray-800">
                    <label
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                        paymentMethod === 'sodexo'
                          ? 'border-[#fe0000] bg-[#fff0f0] dark:bg-red-950/30'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          value="sodexo"
                          checked={paymentMethod === 'sodexo'}
                          onChange={() => setPaymentMethod('sodexo')}
                          className="accent-[#fe0000] w-4 h-4"
                        />
                        <span className="text-sm font-bold">Pluxee / Sodexo Card</span>
                      </div>
                      <span className="text-xs text-gray-500">Meal Voucher</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#0f7a42] shrink-0" />
              <span>PCI-DSS compliant encrypted gateway. No raw card or bank credentials are ever stored.</span>
            </div>
          </div>

          {/* Submit Button on Mobile */}
          <div className="lg:hidden">
            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-2xl mb-4 border border-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-base shadow-lg disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {isSubmitting ? 'Processing...' : `Place Order (₹${calculation.total.toFixed(2)})`}
            </button>
          </div>
        </form>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#fffdfa] dark:bg-[#1e1e24] p-6 sm:p-7 rounded-3xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm sticky top-24 space-y-6">
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Items List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{product.name}</span>
                    <span className="text-gray-500 block text-[11px]">
                      {quantity} × ₹{product.price}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    ₹{(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Item Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  ₹{calculation.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                <span>Delivery Charge{matchedZone ? ` (${matchedZone.location_name})` : ''}</span>
                <span className={calculation.isFreeDelivery ? 'font-bold text-[#0f7a42]' : 'font-semibold text-gray-900 dark:text-gray-100'}>
                  {!calculation.zoneMatched ? 'Enter pincode' : calculation.isFreeDelivery ? 'FREE' : `₹${calculation.deliveryCharge.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-500 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> Estimated Time
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {calculation.estimatedHours != null ? `~${calculation.estimatedHours} Hours` : '—'}
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-base font-extrabold text-gray-900 dark:text-white">
                <span>Total Payable</span>
                <span className="text-[#fe0000] text-xl">
                  ₹{calculation.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Desktop Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="hidden lg:flex w-full py-4 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-base shadow-md hover:shadow-lg disabled:opacity-50 transition-all hover:scale-[1.02] items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : !isAuthenticated ? (
                <span>Sign In to Continue</span>
              ) : (
                <span>Confirm & Pay ₹{calculation.total.toFixed(2)}</span>
              )}
            </button>

            <div className="text-[10px] text-gray-400 text-center space-y-1">
              <p>By placing your order, you agree to the Terms of Service.</p>
              <p>Freshly packed in tamper-evident sealed boxes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
