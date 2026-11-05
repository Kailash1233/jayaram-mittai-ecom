'use client';

// =============================================================================
// JAYARAM MITTAI ADMIN DASHBOARD — LIVE ORDER QUEUE
// Wired to the real backend (/admin/orders). New paid orders arrive over the
// realtime socket (connected in admin/layout.tsx) and ring until a staff
// member clicks Accept, which just moves the order to "preparing".
// =============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  Truck,
  XCircle,
} from 'lucide-react';
import {
  listAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
  type AdminOrderStatus,
} from '@/lib/api/adminOrders';
import { connectAdminRealtime } from '@/lib/api/adminRealtime';
import { useRingingIds } from '@/lib/admin/ringingStore';
import { ApiError } from '@/lib/api/client';

const FILTERS: { key: 'active' | AdminOrderStatus; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'confirmed', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_STYLES: Record<AdminOrderStatus, string> = {
  pending_payment: 'bg-gray-100 text-gray-600',
  confirmed: 'bg-red-50 text-[#fe0000]',
  preparing: 'bg-amber-50 text-amber-700',
  out_for_delivery: 'bg-blue-50 text-blue-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500 line-through',
};

const STATUS_LABELS: Record<AdminOrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  confirmed: 'New order',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const ringing = useRingingIds();

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await listAdminOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load orders.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Light backstop refresh under the realtime socket, in case an event is ever missed.
    const interval = setInterval(load, 45_000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const socket = connectAdminRealtime();
    if (!socket) return;
    socket.on('order:new', load);
    socket.on('order:acknowledged', load);
    return () => {
      socket.off('order:new', load);
      socket.off('order:acknowledged', load);
    };
  }, [load]);

  const visibleOrders = useMemo(() => {
    const list =
      filter === 'active'
        ? orders.filter((o) => !['delivered', 'cancelled', 'pending_payment'].includes(o.status))
        : orders.filter((o) => o.status === filter);
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, filter]);

  const setStatus = async (order: AdminOrder, status: AdminOrderStatus) => {
    setActingOn(order.id);
    try {
      const updated = await updateAdminOrderStatus(order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? (updated as AdminOrder) : o)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the order.');
    } finally {
      setActingOn(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-extrabold text-gray-900">Order Queue</h1>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              filter === f.key ? 'bg-[#fe0000] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-sm text-gray-400">Loading orders…</div>
      ) : visibleOrders.length === 0 ? (
        <div className="py-20 text-center text-sm text-gray-400">No orders here right now.</div>
      ) : (
        <div className="space-y-3">
          {visibleOrders.map((order) => {
            const isRinging = ringing.includes(order.id);
            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-shadow ${
                  isRinging ? 'border-[#fe0000] shadow-[0_0_0_3px_rgba(254,0,0,0.12)] animate-pulse' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-gray-900">{order.order_number}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                      {isRinging && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#fe0000] text-white">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-gray-900">₹{Number(order.total).toFixed(0)}</p>
                    <p className="text-[10px] text-gray-400">{order.payment_status === 'paid' ? 'Paid' : order.payment_status}</p>
                  </div>
                </div>

                <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800">{order.customer.fullName}</p>
                    <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {order.customer.phone}</p>
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>{order.delivery_address.line1}, {order.delivery_address.city} – {order.delivery_address.pincode} ({order.delivery_address.zoneName})</span>
                    </p>
                  </div>
                  <ul className="space-y-0.5">
                    {order.items.map((item, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{item.quantity}× {item.name}</span>
                        <span className="text-gray-400">₹{item.line_total}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {order.customer_notes && (
                  <p className="mt-2 text-xs text-gray-500 italic">"{order.customer_notes}"</p>
                )}

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {order.status === 'confirmed' && (
                    <button
                      disabled={actingOn === order.id}
                      onClick={() => setStatus(order, 'preparing')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fe0000] hover:bg-[#cc0000] text-white text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Accept Order
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      disabled={actingOn === order.id}
                      onClick={() => setStatus(order, 'out_for_delivery')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <Truck className="w-4 h-4" /> Out for Delivery
                    </button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <button
                      disabled={actingOn === order.id}
                      onClick={() => setStatus(order, 'delivered')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Delivered
                    </button>
                  )}
                  {!['delivered', 'cancelled', 'pending_payment'].includes(order.status) && (
                    <button
                      disabled={actingOn === order.id}
                      onClick={() => setStatus(order, 'cancelled')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-red-600 text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
