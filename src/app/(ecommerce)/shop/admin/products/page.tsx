'use client';

// =============================================================================
// JAYARAM MITTAI ADMIN DASHBOARD — PRODUCTS & STOCK
// Wired to the real backend (/admin/products, /admin/products/:id/stock).
// This is the one place that actually changes stock_state — the storefront
// reads it back through GET /api/catalog/products (src/catalog/stock-state.ts
// resolves it on the backend).
// =============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Pencil, Plus, RefreshCw, Search, X } from 'lucide-react';
import {
  createAdminProduct,
  listAdminProducts,
  updateAdminProduct,
  updateAdminProductStock,
  STOCK_STATE_LABELS,
  type AdminProduct,
  type StockAction,
  type StockState,
} from '@/lib/api/adminProducts';
import { ApiError } from '@/lib/api/client';

const STATE_STYLES: Record<StockState, string> = {
  in_stock: 'bg-emerald-50 text-emerald-700',
  temporary_hold: 'bg-amber-50 text-amber-700',
  needs_review: 'bg-red-50 text-[#fe0000]',
  scheduled_hold: 'bg-blue-50 text-blue-700',
  permanent_out_of_stock: 'bg-gray-100 text-gray-500',
};

function StockBadge({ state }: { state: StockState }) {
  return (
    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap ${STATE_STYLES[state]}`}>
      {STOCK_STATE_LABELS[state]}
    </span>
  );
}

function StockActions({
  product,
  onChanged,
}: {
  product: AdminProduct;
  onChanged: (updated: AdminProduct) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [untilDate, setUntilDate] = useState('');
  const [message, setMessage] = useState(product.customMessage ?? '');
  const [restockQty, setRestockQty] = useState(String(product.stock ?? 10));

  const act = async (action: StockAction, payload: Record<string, unknown> = {}) => {
    setBusy(true);
    setErr(null);
    try {
      const updated = await updateAdminProductStock(product.productId, { action, ...payload } as any);
      onChanged(updated);
      setOpen(false);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not update stock.');
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold text-[#fe0000] hover:underline"
      >
        Manage stock
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5 text-xs">
      {err && <p className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{err}</p>}

      {product.stockState !== 'in_stock' && (
        <button
          disabled={busy}
          onClick={() => act('restock', { stock: Number(restockQty) || undefined })}
          className="w-full flex items-center gap-2 disabled:opacity-50"
        >
          <input
            type="number"
            min={0}
            value={restockQty}
            onChange={(e) => setRestockQty(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg"
          />
          <span className="flex-1 text-left font-bold text-emerald-700 hover:underline">Restock → In Stock</span>
        </button>
      )}

      <div className="flex items-center gap-2">
        <input
          type="datetime-local"
          value={untilDate}
          onChange={(e) => setUntilDate(e.target.value)}
          className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg"
        />
      </div>
      <input
        type="text"
        placeholder="Custom message shown to customers (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg"
      />

      <div className="flex flex-wrap gap-2">
        <button
          disabled={busy || product.stockState === 'temporary_hold'}
          onClick={() => act('mark_temporary', { customMessage: message || undefined })}
          className="px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold disabled:opacity-40"
        >
          Temporary hold (24h)
        </button>
        <button
          disabled={busy || !untilDate}
          onClick={() =>
            act('mark_scheduled', {
              outOfStockUntil: new Date(untilDate).toISOString(),
              customMessage: message || undefined,
            })
          }
          className="px-2.5 py-1.5 rounded-lg bg-blue-100 text-blue-800 font-bold disabled:opacity-40"
          title={!untilDate ? 'Pick a return date/time above first' : undefined}
        >
          Scheduled hold (until date)
        </button>
        <button
          disabled={busy || product.stockState === 'permanent_out_of_stock'}
          onClick={() => act('mark_permanent', { customMessage: message || undefined })}
          className="px-2.5 py-1.5 rounded-lg bg-gray-200 text-gray-700 font-bold disabled:opacity-40"
        >
          Discontinue permanently
        </button>
        <button onClick={() => setOpen(false)} className="px-2.5 py-1.5 rounded-lg text-gray-500 font-bold ml-auto">
          Close
        </button>
      </div>
    </div>
  );
}

function EditProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: AdminProduct;
  onClose: () => void;
  onSaved: (updated: AdminProduct) => void;
}) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock ?? ''));
  const [unit, setUnit] = useState(product.unit ?? '');
  const [description, setDescription] = useState(product.description ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      const updated = await updateAdminProduct(product.productId, {
        name,
        price: Number(price),
        stock: stock === '' ? undefined : Number(stock),
        unit: unit || undefined,
        description: description || undefined,
      });
      onSaved(updated);
      onClose();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not save changes.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">Edit {product.name}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        {err && <p className="text-xs text-red-600">{err}</p>}
        <label className="block text-xs font-bold text-gray-600">Name
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs font-bold text-gray-600">Price (₹)
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </label>
          <label className="block text-xs font-bold text-gray-600">Stock qty
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </label>
        </div>
        <label className="block text-xs font-bold text-gray-600">Unit (e.g. 250g)
          <input value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </label>
        <label className="block text-xs font-bold text-gray-600">Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </label>
        <button
          disabled={busy}
          onClick={save}
          className="w-full py-2.5 rounded-xl bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-sm disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function CreateProductModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: AdminProduct) => void }) {
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [productId, setProductId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const create = async () => {
    setBusy(true);
    setErr(null);
    try {
      const created = await createAdminProduct({
        categorySlug,
        categoryName: categoryName || undefined,
        productId,
        name,
        price: Number(price),
        stock: stock === '' ? undefined : Number(stock),
      });
      onCreated(created);
      onClose();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not create product.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">Add a new product</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        {err && <p className="text-xs text-red-600">{err}</p>}
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs font-bold text-gray-600">Category slug
            <input value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} placeholder="desserts" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </label>
          <label className="block text-xs font-bold text-gray-600">Category name (if new)
            <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Desserts" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </label>
        </div>
        <label className="block text-xs font-bold text-gray-600">Product slug (unique)
          <input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="royal-rasamalai" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </label>
        <label className="block text-xs font-bold text-gray-600">Name
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs font-bold text-gray-600">Price (₹)
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </label>
          <label className="block text-xs font-bold text-gray-600">Initial stock
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </label>
        </div>
        <button
          disabled={busy || !categorySlug || !productId || !name || !price}
          onClick={create}
          className="w-full py-2.5 rounded-xl bg-[#fe0000] hover:bg-[#cc0000] text-white font-bold text-sm disabled:opacity-50"
        >
          {busy ? 'Creating…' : 'Create Product'}
        </button>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      setError(null);
      setProducts(await listAdminProducts());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.productId.toLowerCase().includes(q) || p.categorySlug.toLowerCase().includes(q),
    );
  }, [products, query]);

  const replaceProduct = (updated: AdminProduct) =>
    setProducts((prev) => {
      const exists = prev.some((p) => p.productId === updated.productId);
      return exists ? prev.map((p) => (p.productId === updated.productId ? updated : p)) : [updated, ...prev];
    });

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {editing && (
        <EditProductModal product={editing} onClose={() => setEditing(null)} onSaved={replaceProduct} />
      )}
      {creating && <CreateProductModal onClose={() => setCreating(false)} onCreated={replaceProduct} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-extrabold text-gray-900">Products &amp; Stock</h1>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#fe0000] hover:bg-[#cc0000] px-3 py-1.5 rounded-full">
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, slug, or category…"
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#fe0000]"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-sm text-gray-400">Loading products…</div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((product) => (
            <div key={product.productId} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm text-gray-900">{product.name}</p>
                    <StockBadge state={product.stockState} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {product.categoryName ?? product.categorySlug} · <span className="font-mono">{product.productId}</span>
                  </p>
                  {product.customMessage && (
                    <p className="text-xs text-gray-500 mt-1 italic">"{product.customMessage}"</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">₹{product.price}</p>
                  <p className="text-xs text-gray-400">{product.stock ?? '—'} in stock</p>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-4">
                <button onClick={() => setEditing(product)} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <StockActions product={product} onChanged={replaceProduct} />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-20 text-center text-sm text-gray-400">No products match "{query}".</div>
          )}
        </div>
      )}
    </div>
  );
}
