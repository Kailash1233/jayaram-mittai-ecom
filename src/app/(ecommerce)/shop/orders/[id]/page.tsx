'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — ORDER CONFIRMATION & LIVE TRACKING
// Reference: Section 1, 14, 18 of "e commerce - master.md"
// =============================================================================

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Package,
  Truck,
  Check,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { JayaramMittaiOrderStatus } from '@/lib/ecommerce/types';

interface OrderData {
  id: string;
  orderNumber: string;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: JayaramMittaiOrderStatus;
  estimatedHours: number;
  paymentStatus: string;
  paymentMethod: string;
  items: Array<{
    name: string;
    price: number;
    unit: string;
    quantity: number;
    lineTotal: number;
  }>;
  customer: {
    fullName: string;
    phone: string;
  };
  deliveryAddress: {
    line1: string;
    city: string;
    pincode: string;
    zoneName: string;
  };
  createdAt: string;
}

const ORDER_STEPS: Array<{ key: JayaramMittaiOrderStatus; label: string; icon: any }> = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'preparing', label: 'Packing Fresh', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Check },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    // Attempt to load from sessionStorage or fallback mock
    try {
      const cached = sessionStorage.getItem(`jm_order_${orderId}`);
      if (cached) {
        setOrder(JSON.parse(cached));
      } else {
        // Fallback simulated order for visual preview
        setOrder({
          id: orderId,
          orderNumber: `JM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-7821`,
          subtotal: 970,
          deliveryCharge: 0,
          total: 970,
          status: 'confirmed',
          estimatedHours: 2,
          paymentStatus: 'paid',
          paymentMethod: 'upi',
          items: [
            {
              name: 'Royal Rasamalai',
              price: 120,
              unit: '2 pcs',
              quantity: 2,
              lineTotal: 240,
            },
            {
              name: 'Grand Festive Celebration Box',
              price: 850,
              unit: '1 kg Box',
              quantity: 1,
              lineTotal: 850,
            },
          ],
          customer: {
            fullName: 'Valued Customer',
            phone: '9840012345',
          },
          deliveryAddress: {
            line1: 'Radha Nagar Main Road',
            city: 'Chennai',
            pincode: '600044',
            zoneName: 'Chromepet',
          },
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      // Ignored
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#fe0000] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading your order details...</p>
      </div>
    );
  }

  // Calculate current step index
  const stepKeys = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  const currentStepIndex = Math.max(0, stepKeys.indexOf(order.status));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      {/* Confirmation Header Banner */}
      <div className="text-center space-y-3 bg-[#fffdfa] dark:bg-[#1e1e24] p-8 rounded-3xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#fff0f0] dark:bg-green-950/40 text-[#76e000] mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full bg-[#ffe6e6] dark:bg-red-950/40 text-[#fe0000] text-xs font-extrabold uppercase tracking-wider">
          Order Confirmed
        </span>
        <h1 className="font-serif font-extrabold text-2xl sm:text-4xl text-gray-900 dark:text-white">
          Thank you for choosing Jayaram Mittai!
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
          Your order has been received and sent to our kitchen for artisanal packing.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <div className="px-3.5 py-1.5 bg-[#f9f4ec] dark:bg-[#25252d] rounded-full border border-[#e8e4da] dark:border-[#2e2e38]">
            Order Ref: <strong className="text-[#fe0000] font-mono">{order.orderNumber}</strong>
          </div>
          <div className="px-3.5 py-1.5 bg-[#f9f4ec] dark:bg-[#25252d] rounded-full border border-[#e8e4da] dark:border-[#2e2e38] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#fe0000]" />
            <span>Est. Delivery: ~{order.estimatedHours} Hours</span>
          </div>
        </div>
      </div>

      {/* Visual 5-Step Order Timeline */}
      <div className="bg-[#fffdfa] dark:bg-[#1e1e24] p-6 sm:p-8 rounded-3xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
          Live Status Timeline
        </h3>

        <div className="grid grid-cols-5 gap-2 text-center relative">
          {ORDER_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center space-y-2 relative z-10">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-[#fe0000] text-white shadow-md shadow-red-500/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-red-200 dark:ring-red-900/50 scale-110' : ''}`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-bold leading-tight ${
                    isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details & Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Items Breakdown */}
        <div className="md:col-span-7 bg-[#fffdfa] dark:bg-[#1e1e24] p-6 sm:p-7 rounded-3xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <ShoppingBag className="w-4 h-4 text-[#fe0000]" />
            <span>Itemized Receipt</span>
          </h3>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0"
              >
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">{item.name}</h4>
                  <span className="text-gray-500 text-[11px]">
                    {item.quantity} × ₹{item.price} ({item.unit})
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  ₹{item.lineTotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className={order.deliveryCharge === 0 ? 'font-bold text-[#76e000]' : 'font-bold text-gray-900 dark:text-gray-100'}>
                {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge.toFixed(2)}`}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-sm font-extrabold text-gray-900 dark:text-white">
              <span>Amount Paid</span>
              <span className="text-[#fe0000] text-base">₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#fffdfa] dark:bg-[#1e1e24] p-6 sm:p-7 rounded-3xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <MapPin className="w-4 h-4 text-[#fe0000]" />
              <span>Delivery Address</span>
            </h3>

            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <p className="font-bold text-gray-900 dark:text-white">{order.customer.fullName}</p>
              <p>{order.deliveryAddress.line1}</p>
              <p>{order.deliveryAddress.city} – {order.deliveryAddress.pincode}</p>
              <p className="text-[#fe0000] font-semibold pt-1">Zone: {order.deliveryAddress.zoneName}</p>
              <p className="text-gray-500 pt-1">📞 {order.customer.phone}</p>
            </div>
          </div>

          {/* WhatsApp Support Button */}
          <a
            href={`https://wa.me/919840012345?text=Hi%20Jayaram%20Mittai%2C%20regarding%20my%20order%20${order.orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp for Updates</span>
          </a>

          <Link
            href="/shop"
            className="w-full py-3.5 rounded-full bg-[#f8f6f0] dark:bg-[#25252d] border border-[#e8e4da] dark:border-[#2e2e38] text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-2 hover:border-[#fe0000] transition-colors"
          >
            <span>Order More Delights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
