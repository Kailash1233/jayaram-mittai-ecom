'use client';

// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — MANAGEMENT / KITCHEN DASHBOARD
// Professional fonts, Live Orders with running timers, standard color workflow buttons
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import {
  Store,
  Clock,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Truck,
  Eye,
  Check,
  X,
  RefreshCw,
  Search,
  ArrowLeft,
  ChevronRight,
  Upload,
  FileSpreadsheet,
  Download,
  Image as ImageIcon,
  AlertTriangle,
  Timer,
} from 'lucide-react';
import { JayaramMittaiProduct, JayaramMittaiOrderStatus } from '@/lib/ecommerce/types';
import { getActiveProducts } from '@/lib/ecommerce/queries';
import { SEED_PRODUCTS } from '@/lib/ecommerce/catalog-seed';

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  itemsSummary: string;
  total: number;
  status: JayaramMittaiOrderStatus;
  createdAt: number;
  address: string;
}

interface UploadSummary {
  success: boolean;
  filename: string;
  totalRowsInFile: number;
  createdCount: number;
  updatedCount: number;
  rejectedCount: number;
  createdItems: string[];
  updatedItems: string[];
  rejectedRows: Array<{
    rowNumber: number;
    item?: string;
    category?: string;
    reason: string;
  }>;
  message: string;
}

export default function ShopAdminPage() {
  const [activeTab, setActiveTab] = useState<'availability' | 'orders' | 'upload'>('orders');
  const [products, setProducts] = useState<JayaramMittaiProduct[]>(SEED_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Running live timer clock (ticks every second)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Selected product for custom out-of-stock duration modal
  const [selectedProductForOos, setSelectedProductForOos] = useState<JayaramMittaiProduct | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [reopenDurationHours, setReopenDurationHours] = useState('24');

  // Selected product for Change Image modal
  const [selectedProductForImage, setSelectedProductForImage] = useState<JayaramMittaiProduct | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [imageSaveMessage, setImageSaveMessage] = useState<string | null>(null);

  // Excel Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Orders with realistic initial start times
  const [orders, setOrders] = useState<AdminOrder[]>([
    {
      id: 'ord-101',
      orderNumber: 'JM-20260829-9142',
      customerName: 'Ananya S.',
      phone: '9840012345',
      itemsSummary: '2× Royal Rasamalai, 1× Grand Festive Box',
      total: 1090,
      status: 'confirmed',
      createdAt: Date.now() - 5 * 60 * 1000 - 24 * 1000, // 5m 24s ago
      address: 'Radha Nagar, Chromepet',
    },
    {
      id: 'ord-102',
      orderNumber: 'JM-20260829-8831',
      customerName: 'Suresh Narayanan',
      phone: '9840088888',
      itemsSummary: '2× Tandoori Paneer Tikka, 4× Butter Naan',
      total: 700,
      status: 'preparing',
      createdAt: Date.now() - 18 * 60 * 1000 - 45 * 1000, // 18m 45s ago
      address: '4th Main Road, Nanganallur',
    },
    {
      id: 'ord-103',
      orderNumber: 'JM-20260829-7612',
      customerName: 'Pooja Venkatesh',
      phone: '9840055555',
      itemsSummary: '1× Rich Badam Basundi, 2× Badam Milk',
      total: 320,
      status: 'out_for_delivery',
      createdAt: Date.now() - 42 * 60 * 1000 - 12 * 1000, // 42m 12s ago
      address: 'GST Road, Tambaram',
    },
  ]);

  // Format running live timer
  const formatTimer = (createdTimestamp: number) => {
    const totalSecs = Math.max(0, Math.floor((currentTime - createdTimestamp) / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const refreshProducts = async () => {
    setIsLoading(true);
    try {
      const prods = await getActiveProducts();
      setProducts(prods);
    } catch {}
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const handleToggleOutOfStock = (productId: string, currentState: boolean) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            out_of_stock: {
              id: `oos_${p.id}`,
              product_id: p.id,
              is_out_of_stock: !currentState,
              out_of_stock_until: !currentState
                ? new Date(Date.now() + 24 * 3600 * 1000).toISOString()
                : null,
              custom_message: !currentState ? 'Fresh batch in preparation.' : null,
              set_by_admin_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          };
        }
        return p;
      })
    );
  };

  const handleSaveCustomOutOfStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForOos) return;

    const hours = parseInt(reopenDurationHours) || 24;
    const reopenDate = new Date(Date.now() + hours * 3600 * 1000).toISOString();

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === selectedProductForOos.id) {
          return {
            ...p,
            out_of_stock: {
              id: `oos_${p.id}`,
              product_id: p.id,
              is_out_of_stock: true,
              out_of_stock_until: reopenDate,
              custom_message: customMessage.trim() || 'Fresh batch in preparation.',
              set_by_admin_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          };
        }
        return p;
      })
    );

    setSelectedProductForOos(null);
  };

  // Handle Image Override
  const handleSaveImageOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForImage) return;

    setIsSavingImage(true);
    setImageSaveMessage(null);

    try {
      const res = await fetch('/api/ecommerce/admin/products/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductForImage.id,
          imageUrl: customImageUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setImageSaveMessage(data.error || 'Failed to update image.');
        setIsSavingImage(false);
        return;
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProductForImage.id ? { ...p, image_url: data.product.image_url } : p
        )
      );

      setImageSaveMessage(data.message || 'Image updated successfully!');
      setTimeout(() => {
        setSelectedProductForImage(null);
        setImageSaveMessage(null);
      }, 1200);
    } catch (err: any) {
      setImageSaveMessage(err?.message || 'Network error.');
    } finally {
      setIsSavingImage(false);
    }
  };

  // Handle Excel Menu Upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSummary(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await fetch('/api/ecommerce/admin/menu/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setUploadError(data.error || data.message || 'Failed to process Excel file.');
        setIsUploading(false);
        return;
      }

      setUploadSummary(data);
      refreshProducts();
    } catch (err: any) {
      setUploadError(err?.message || 'Network error while uploading file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Download Sample Excel Template
  const handleDownloadSampleExcel = () => {
    const sampleRows = [
      { category: 'Sweets & Desserts', item: 'Royal Rasamalai', qty_or_grams: '2 pcs', price: 120 },
      { category: 'Sweets & Desserts', item: 'Rich Badam Basundi', qty_or_grams: '250g', price: 180 },
      { category: 'Sweets & Desserts', item: 'Ghee Mysore Pak', qty_or_grams: '250g', price: 250 },
      { category: 'Sweets & Desserts', item: 'Kaju Katli', qty_or_grams: '250g', price: 330 },
      { category: 'Savouries & Snacks', item: 'Special Mixture', qty_or_grams: '250g', price: 140 },
      { category: 'Savouries & Snacks', item: 'Madras Mixture', qty_or_grams: '250g', price: 120 },
      { category: 'Savouries & Snacks', item: 'Kara Sev Pepper', qty_or_grams: '250g', price: 125 },
      { category: 'Chaats & Sandwiches', item: 'Pani Puri', qty_or_grams: '6 pcs', price: 50 },
      { category: 'North Indian & Rotis', item: 'Tandoori Butter Naan', qty_or_grams: '1 pc', price: 65 },
      { category: 'Rice & Biryani', item: 'Paneer Fried Rice', qty_or_grams: '500g', price: 210 },
      { category: 'Tandoori Starters & Juices', item: 'Tandoori Paneer Tikka', qty_or_grams: '6 pcs', price: 260 },
      { category: 'Tandoori Starters & Juices', item: 'Fresh Pomegranate Juice', qty_or_grams: '300 ml', price: 110 },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Menu');
    XLSX.writeFile(workbook, 'jayaram_mittai_menu_template.xlsx');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: JayaramMittaiOrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-[#f8f6f0] dark:bg-[#121214] text-[#1f2937] dark:text-[#f3f4f6] font-sans antialiased">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#1e1e24] border-b border-[#e8e4da] dark:border-[#2e2e38] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-lg sm:text-xl leading-none text-gray-900 dark:text-white tracking-tight">
              Kitchen & Operations Desk
            </h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Jayaram Mittai Management Portal
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/shop"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white text-xs font-bold shadow-sm transition-all hover:scale-105"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-sans">
          <div className="bg-white dark:bg-[#1e1e24] p-4 sm:p-5 rounded-2xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm">
            <span className="text-xs text-gray-500 block mb-1 font-semibold">Active Orders</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#fe0000]">
                {orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length}
              </span>
              <Package className="w-5 h-5 text-red-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1e24] p-4 sm:p-5 rounded-2xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm">
            <span className="text-xs text-gray-500 block mb-1 font-semibold">In Kitchen / Packing</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-orange-500">
                {orders.filter((o) => o.status === 'preparing').length}
              </span>
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1e24] p-4 sm:p-5 rounded-2xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm">
            <span className="text-xs text-gray-500 block mb-1 font-semibold">Total Menu Dishes</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-blue-600">
                {products.length}
              </span>
              <Store className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1e24] p-4 sm:p-5 rounded-2xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm">
            <span className="text-xs text-gray-500 block mb-1 font-semibold">Out of Stock Dishes</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-gray-700 dark:text-gray-300">
                {products.filter((p) => p.out_of_stock?.is_out_of_stock).length}
              </span>
              <AlertCircle className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Tab Switching Bar */}
        <div className="flex border-b border-[#e8e4da] dark:border-[#2e2e38] gap-4 sm:gap-6 overflow-x-auto no-scrollbar font-sans">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 font-bold text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#fe0000] text-[#fe0000]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            📦 Live Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`pb-3 font-bold text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'availability'
                ? 'border-[#fe0000] text-[#fe0000]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            ⚡ Menu & Stock Manager ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 font-bold text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-[#fe0000] text-[#fe0000]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            📑 Excel Bulk Menu Upload
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: LIVE ORDERS WITH RUNNING TIMERS & STANDARD COLOR ACTION BUTTONS */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white tracking-tight">
                  Live Orders
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Real-time kitchen ticket queue with live running preparation timers and order workflow triggers.
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full self-start sm:self-auto">
                Auto-refreshing every 1s
              </span>
            </div>

            <div className="space-y-3">
              {orders.map((order) => {
                const isConfirmed = order.status === 'confirmed';
                const isPreparing = order.status === 'preparing';
                const isDispatched = order.status === 'out_for_delivery';
                const isDelivered = order.status === 'delivered';

                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-[#1e1e24] p-5 rounded-2xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm space-y-3 transition-all hover:shadow-md"
                  >
                    {/* Order Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-[#fe0000]">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          {/* Live Running Timer */}
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-900/50">
                            <Timer className="w-3.5 h-3.5 animate-pulse" />
                            <span>{formatTimer(order.createdAt)}</span>
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">
                          {order.customerName} (📞 {order.phone})
                        </p>
                        <p className="text-xs text-gray-500">{order.address}</p>
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                        <span className="text-lg font-extrabold text-[#fe0000] font-mono">
                          ₹{order.total.toFixed(2)}
                        </span>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full mt-1 ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : isDispatched
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : isPreparing
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                          }`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Items Summary */}
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-gray-100">Items:</strong> {order.itemsSummary}
                    </p>

                    {/* Standard Color Workflow Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      {/* Confirm Button — Standard Orange */}
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isConfirmed
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-300'
                            : 'bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60'
                        }`}
                      >
                        {isConfirmed && <Check className="w-3.5 h-3.5" />}
                        <span>Confirm</span>
                      </button>

                      {/* Start Packing Button — Standard Violet / Purple */}
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isPreparing
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 ring-2 ring-purple-300'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                        }`}
                      >
                        {isPreparing && <Check className="w-3.5 h-3.5" />}
                        <span>Start Packing</span>
                      </button>

                      {/* Dispatch Button — Standard Blue */}
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isDispatched
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-300'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                        }`}
                      >
                        {isDispatched && <Check className="w-3.5 h-3.5" />}
                        <span>Dispatch (Out for Delivery)</span>
                      </button>

                      {/* Mark Delivered Button — Standard Green */}
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isDelivered
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                        }`}
                      >
                        {isDelivered && <Check className="w-3.5 h-3.5" />}
                        <span>Mark Delivered</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MENU & STOCK AVAILABILITY MANAGER */}
        {/* ========================================================================= */}
        {activeTab === 'availability' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white tracking-tight">
                  Menu Items & Availability Manager
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Instantly toggle out-of-stock items, set custom return messages, or override dish photography.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter dishes by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1e1e24] border border-[#e8e4da] dark:border-[#2e2e38] rounded-xl text-xs font-medium focus:outline-none focus:border-[#fe0000] text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.out_of_stock?.is_out_of_stock || false;

                return (
                  <div
                    key={product.id}
                    className={`bg-white dark:bg-[#1e1e24] p-4 rounded-2xl border transition-all shadow-sm space-y-3 ${
                      isOutOfStock
                        ? 'border-red-300 dark:border-red-900/60 bg-red-50/20'
                        : 'border-[#e8e4da] dark:border-[#2e2e38]'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={product.image_url || '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg'}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {product.name}
                        </h4>
                        <span className="text-xs text-[#fe0000] font-bold block mt-0.5">
                          ₹{product.price} / {product.unit}
                        </span>
                        {isOutOfStock && product.out_of_stock?.custom_message && (
                          <p className="text-[10px] text-red-600 dark:text-red-400 truncate mt-0.5">
                            {product.out_of_stock.custom_message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/80">
                      <button
                        onClick={() => {
                          setSelectedProductForImage(product);
                          setCustomImageUrl(product.image_url || '');
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-[11px] font-semibold text-gray-600 dark:text-gray-300"
                        title="Override Image for this dish"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#fe0000]" />
                        <span>Change Photo</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedProductForOos(product);
                            setCustomMessage(product.out_of_stock?.custom_message || 'Fresh batch in preparation.');
                          }}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                          title="Set Custom Duration / Message"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleOutOfStock(product.id, isOutOfStock)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            isOutOfStock
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-[#76e000] text-gray-900 hover:bg-green-500'
                          }`}
                        >
                          {isOutOfStock ? 'Sold Out' : 'In Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EXCEL BULK MENU UPLOAD */}
        {/* ========================================================================= */}
        {activeTab === 'upload' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-white dark:bg-[#1e1e24] p-6 sm:p-7 rounded-3xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-[#fe0000]" />
                    <span>Bulk Excel Menu Import</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Upload your restaurant dishes in bulk. Images will automatically resolve from the shared library!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSampleExcel}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f8f6f0] dark:bg-[#25252d] border border-[#e8e4da] dark:border-[#2e2e38] text-xs font-bold text-gray-800 dark:text-gray-200 hover:border-[#fe0000] transition-colors"
                >
                  <Download className="w-4 h-4 text-[#fe0000]" />
                  <span>Download Sample Excel Template</span>
                </button>
              </div>

              <div className="bg-[#fff0f0] dark:bg-red-950/20 p-4 rounded-2xl border border-[#fcd4d4] dark:border-red-900/40 text-xs text-gray-700 dark:text-gray-300 space-y-2">
                <p className="font-bold text-[#fe0000] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Required Excel Columns (.xlsx / .xls):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 bg-white dark:bg-[#1a1a1e] rounded-lg border border-red-200 dark:border-red-900/50">
                    <strong>category</strong><br /><span className="text-gray-400">e.g. Traditional Sweets</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#1a1a1e] rounded-lg border border-red-200 dark:border-red-900/50">
                    <strong>item</strong><br /><span className="text-gray-400">e.g. Royal Rasamalai</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#1a1a1e] rounded-lg border border-red-200 dark:border-red-900/50">
                    <strong>qty_or_grams</strong><br /><span className="text-gray-400">e.g. 250g / 2 pcs</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#1a1a1e] rounded-lg border border-red-200 dark:border-red-900/50">
                    <strong>price</strong><br /><span className="text-gray-400">e.g. 180</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 pt-1">
                  * Note: <strong>No image column is required in your Excel sheet.</strong> Canonical dish images are automatically matched from the cross-tenant library.
                </p>
              </div>

              <form onSubmit={handleFileUpload} className="space-y-4 pt-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#fe0000] rounded-2xl p-8 text-center cursor-pointer transition-colors bg-[#fdfcfb] dark:bg-[#18181c]"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                        setUploadError(null);
                        setUploadSummary(null);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-[#fff0f0] dark:bg-red-950/40 text-[#fe0000] mx-auto flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {uploadFile ? uploadFile.name : 'Click to select or drag & drop Excel (.xlsx / .xls) file'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {uploadFile ? `${(uploadFile.size / 1024).toFixed(1)} KB selected` : 'Automatic duplicate matching & validation'}
                  </p>
                </div>

                {uploadError && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-2xl border border-red-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  {uploadFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadFile(null);
                        setUploadSummary(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-5 py-2.5 rounded-full border border-gray-300 text-xs font-bold hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!uploadFile || isUploading}
                    className="px-7 py-3 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validating & Importing Menu...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload & Import Menu</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {uploadSummary && (
              <div className="bg-white dark:bg-[#1e1e24] p-6 sm:p-7 rounded-3xl border border-[#e8e4da] dark:border-[#2e2e38] shadow-sm space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h4 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#76e000]" />
                    <span>Import Results Summary</span>
                  </h4>
                  <span className="text-xs font-mono text-gray-500">{uploadSummary.filename}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3.5 bg-green-50 dark:bg-green-950/30 rounded-2xl border border-green-200 dark:border-green-900/40">
                    <span className="text-xs text-green-700 dark:text-green-300 font-semibold block">New Dishes Created</span>
                    <span className="text-2xl font-bold text-green-600">{uploadSummary.createdCount}</span>
                  </div>
                  <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/40">
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold block">Dishes Updated</span>
                    <span className="text-2xl font-bold text-blue-600">{uploadSummary.updatedCount}</span>
                  </div>
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/40">
                    <span className="text-xs text-red-700 dark:text-red-300 font-semibold block">Rows Rejected</span>
                    <span className="text-2xl font-bold text-red-600">{uploadSummary.rejectedCount}</span>
                  </div>
                </div>

                {uploadSummary.rejectedRows.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-red-600 uppercase">Rejected Rows Details:</h5>
                    <div className="max-h-48 overflow-y-auto border border-red-200 rounded-xl">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-red-50 text-red-700 font-bold sticky top-0">
                          <tr>
                            <th className="p-2">Row #</th>
                            <th className="p-2">Dish</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadSummary.rejectedRows.map((rej, i) => (
                            <tr key={i} className="border-t border-red-100">
                              <td className="p-2 font-mono">{rej.rowNumber}</td>
                              <td className="p-2 font-bold">{rej.item || '—'}</td>
                              <td className="p-2">{rej.category || '—'}</td>
                              <td className="p-2 text-red-600">{rej.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Change Image Modal */}
      {selectedProductForImage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e24] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#fe0000]" />
                <span>Custom Image Override</span>
              </h3>
              <button
                onClick={() => setSelectedProductForImage(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveImageOverride} className="space-y-4">
              <div>
                <span className="text-xs text-gray-500">Dish Name</span>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  {selectedProductForImage.name}
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#f8f6f0] dark:bg-[#121214] rounded-2xl border border-[#e8e4da] dark:border-[#2e2e38]">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={customImageUrl || selectedProductForImage.image_url || '/images/food/Rasamalai_plated_on_white_dish_202608251905.jpeg'}
                    alt={selectedProductForImage.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Live Preview</p>
                  <p className="text-[11px] line-clamp-1">
                    {customImageUrl ? 'Custom tenant photo URL' : 'Using canonical shared library image'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Custom Image URL (Overrides shared library for this dish)
                </label>
                <input
                  type="text"
                  placeholder="https://... or /images/food/..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-[#f8f6f0] dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] focus:outline-none focus:ring-2 focus:ring-[#fe0000] text-gray-900 dark:text-gray-100"
                />
              </div>

              {imageSaveMessage && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs rounded-xl border border-blue-200">
                  {imageSaveMessage}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomImageUrl('')}
                  className="text-xs text-gray-500 hover:text-[#fe0000] underline"
                >
                  Reset to Shared Library
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProductForImage(null)}
                    className="px-4 py-2 rounded-full border border-gray-300 text-xs font-bold hover:bg-gray-50 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingImage}
                    className="px-5 py-2 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white text-xs font-bold shadow-md disabled:opacity-50"
                  >
                    {isSavingImage ? 'Saving...' : 'Apply Image'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Out of Stock Modal */}
      {selectedProductForOos && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e24] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Out of Stock Setting
              </h3>
              <button
                onClick={() => setSelectedProductForOos(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomOutOfStock} className="space-y-4">
              <div>
                <span className="text-xs text-gray-500">Dish Name</span>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  {selectedProductForOos.name}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Customer-Facing Unavailable Message
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh evening batch ready by 5:00 PM"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-[#f8f6f0] dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] focus:outline-none focus:ring-2 focus:ring-[#fe0000] text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Auto-Reopen Duration
                </label>
                <select
                  value={reopenDurationHours}
                  onChange={(e) => setReopenDurationHours(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-[#f8f6f0] dark:bg-[#121214] border border-[#e8e4da] dark:border-[#2e2e38] focus:outline-none focus:ring-2 focus:ring-[#fe0000] text-gray-900 dark:text-gray-100"
                >
                  <option value="2">2 Hours</option>
                  <option value="4">4 Hours</option>
                  <option value="8">8 Hours</option>
                  <option value="12">12 Hours</option>
                  <option value="24">24 Hours (Next Day)</option>
                  <option value="48">48 Hours</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductForOos(null)}
                  className="px-4 py-2 rounded-full border border-gray-300 text-xs font-bold hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#fe0000] hover:bg-[#cc0000] text-white text-xs font-bold shadow-md"
                >
                  Save & Mark Sold Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
