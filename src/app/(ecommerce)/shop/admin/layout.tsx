'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ClipboardList, LogOut, Package } from 'lucide-react';
import { useAdminSession } from '@/lib/api/adminTokenStore';
import { adminLogout } from '@/lib/api/adminClient';
import { listAdminOrders } from '@/lib/api/adminOrders';
import { connectAdminRealtime, disconnectAdminRealtime, isRealtimeConfigured } from '@/lib/api/adminRealtime';
import { addRinging, removeRinging, setRingingIds, useRingingIds } from '@/lib/admin/ringingStore';
import { startAlert, stopAlert } from '@/lib/admin/alertTone';

const NAV_ITEMS = [
  { href: '/shop/admin', label: 'Orders', icon: ClipboardList },
  { href: '/shop/admin/products', label: 'Products & Stock', icon: Package },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAdminSession();
  const ringing = useRingingIds();
  const isLoginPage = pathname === '/shop/admin/login';

  // Guard: bounce to login when signed out (and never redirect away from the login page itself).
  useEffect(() => {
    if (!isLoginPage && !session) {
      router.replace('/shop/admin/login');
    }
  }, [isLoginPage, session, router]);

  // Seed the "new, unaccepted" set on load/sign-in, then keep it live over the socket.
  useEffect(() => {
    if (isLoginPage || !session) return;

    let cancelled = false;
    listAdminOrders('confirmed')
      .then((orders) => {
        if (!cancelled) setRingingIds(orders.map((o) => o.id));
      })
      .catch(() => {
        // transient — the socket will still keep things live from here
      });

    const socket = connectAdminRealtime();
    if (!socket) return () => {
      cancelled = true;
    };

    const handleNewOrder = (order: { id: string }) => addRinging(order.id);
    const handleAcknowledged = ({ orderId }: { orderId: string }) => removeRinging(orderId);
    socket.on('order:new', handleNewOrder);
    socket.on('order:acknowledged', handleAcknowledged);

    return () => {
      cancelled = true;
      socket.off('order:new', handleNewOrder);
      socket.off('order:acknowledged', handleAcknowledged);
    };
  }, [isLoginPage, session]);

  // Disconnect the socket entirely on sign-out / unmount.
  useEffect(() => {
    if (isLoginPage || !session) {
      disconnectAdminRealtime();
      setRingingIds([]);
    }
    return () => disconnectAdminRealtime();
  }, [isLoginPage, session]);

  // Ring until every new order has been accepted.
  useEffect(() => {
    if (ringing.length > 0) startAlert();
    else stopAlert();
    return () => stopAlert();
  }, [ringing.length]);

  if (isLoginPage) return <>{children}</>;
  if (!session) return null; // redirecting

  return (
    <div className="min-h-screen flex bg-[#f6f7f9] text-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-[#fe0000] p-1 flex items-center justify-center shrink-0">
            <Image src="/logo.png" alt="" width={28} height={28} className="object-contain" />
          </div>
          <span className="font-bold text-sm leading-tight">Jayaram Mittai<br /><span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Staff Panel</span></span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active ? 'bg-[#fe0000]/10 text-[#fe0000]' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={async () => {
              await adminLogout();
              router.replace('/shop/admin/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#fe0000] p-1 flex items-center justify-center">
              <Image src="/logo.png" alt="" width={24} height={24} className="object-contain" />
            </div>
            <span className="font-bold text-sm">Staff Panel</span>
          </div>
          <div className="hidden md:block text-sm font-semibold text-gray-500">
            {NAV_ITEMS.find((i) => i.href === pathname)?.label ?? ''}
          </div>
          <div className="flex items-center gap-3">
            {!isRealtimeConfigured() && (
              <span className="hidden sm:inline text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                Live alerts not configured
              </span>
            )}
            <Link
              href="/shop/admin"
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={`${ringing.length} new order${ringing.length === 1 ? '' : 's'} awaiting acceptance`}
            >
              <Bell className={`w-5 h-5 ${ringing.length > 0 ? 'text-[#fe0000] animate-pulse' : 'text-gray-400'}`} />
              {ringing.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#fe0000] text-white text-[10px] font-extrabold flex items-center justify-center">
                  {ringing.length}
                </span>
              )}
            </Link>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-gray-800 leading-none">{session.user.email}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{session.user.role}</p>
            </div>
            <button
              onClick={async () => {
                await adminLogout();
                router.replace('/shop/admin/login');
              }}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 text-gray-500"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile nav row */}
        <nav className="md:hidden flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-white overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  active ? 'bg-[#fe0000] text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
