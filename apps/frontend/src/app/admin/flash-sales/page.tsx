'use client';

import { useEffect, useState } from 'react';
import { Plus, Zap, Pencil, Trash2, Check, X, Clock } from 'lucide-react';
import api from '@/lib/api';

type FlashProduct = { productId: string; salePrice: number; product?: { name: string; price: number } };
type FlashSale = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  products: FlashProduct[];
};

type Product = { id: string; name: string; price: number };

const fmt = (d: string) => new Date(d).toLocaleString('uk-UA', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const toInput = (d: string) => new Date(d).toISOString().slice(0, 16);

function statusBadge(sale: FlashSale) {
  const now = Date.now();
  const starts = new Date(sale.startsAt).getTime();
  const ends = new Date(sale.endsAt).getTime();
  if (!sale.isActive) return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">Вимкнено</span>;
  if (now < starts) return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">Заплановано</span>;
  if (now >= starts && now <= ends) return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Активний</span>;
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">Завершено</span>;
}

export default function FlashSalesPage() {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FlashSale | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', startsAt: '', endsAt: '', isActive: true });
  const [saleItems, setSaleItems] = useState<{ productId: string; salePrice: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const loadSales = () => {
    api.get('/flash-sales').then(r => setSales(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSales();
    api.get('/products?limit=100&onlyActive=false&minimal=true').then(r => setProducts(r.data.data ?? [])).catch(() => {});
  }, []);

  const openCreate = () => {
    const now = new Date();
    const later = new Date(now.getTime() + 24 * 3600 * 1000);
    setForm({ name: '', startsAt: toInput(now.toISOString()), endsAt: toInput(later.toISOString()), isActive: true });
    setSaleItems([{ productId: '', salePrice: '' }]);
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (sale: FlashSale) => {
    setForm({ name: sale.name, startsAt: toInput(sale.startsAt), endsAt: toInput(sale.endsAt), isActive: sale.isActive });
    setSaleItems(sale.products.map(p => ({ productId: p.productId, salePrice: String(p.salePrice) })));
    setEditing(sale);
    setCreating(true);
  };

  const handleSave = async () => {
    const validItems = saleItems.filter(i => i.productId && i.salePrice);
    if (!form.name || !form.startsAt || !form.endsAt || validItems.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        products: validItems.map(i => ({ productId: i.productId, salePrice: parseFloat(i.salePrice) })),
      };
      if (editing) {
        await api.patch(`/flash-sales/${editing.id}`, payload);
      } else {
        await api.post('/flash-sales', payload);
      }
      setCreating(false);
      loadSales();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити флеш-розпродаж?')) return;
    await api.delete(`/flash-sales/${id}`);
    loadSales();
  };

  const handleToggle = async (sale: FlashSale) => {
    await api.patch(`/flash-sales/${sale.id}`, { isActive: !sale.isActive });
    loadSales();
  };

  if (loading) return (
    <div className="space-y-4">
      {[1, 2].map(i => <div key={i} className="h-20 animate-pulse rounded-[2rem] bg-white" />)}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Флеш-розпродажі</h1>
          <p className="mt-1 text-sm text-slate-500">Обмежені за часом акції з таймером зворотного відліку</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Створити
        </button>
      </div>

      {/* Form */}
      {creating && (
        <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="mb-5 font-semibold text-dark">{editing ? 'Редагувати' : 'Новий флеш-розпродаж'}</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Назва</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Наприклад: Літня акція на рибу!"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Початок</label>
                <input type="datetime-local" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Кінець</label>
                <input type="datetime-local" value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                className={`relative h-6 w-11 rounded-full transition ${form.isActive ? 'bg-primary' : 'bg-slate-200'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm text-slate-700">Активний</span>
            </div>

            {/* Products */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Товари зі спеціальними цінами</label>
                <button onClick={() => setSaleItems(i => [...i, { productId: '', salePrice: '' }])}
                  className="text-xs text-primary hover:underline">+ Додати товар</button>
              </div>
              <div className="space-y-3">
                {saleItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <select value={item.productId}
                      onChange={e => setSaleItems(items => items.map((it, i) => i === idx ? { ...it, productId: e.target.value } : it))}
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none">
                      <option value="">Виберіть товар</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} — {p.price} грн</option>
                      ))}
                    </select>
                    <input value={item.salePrice}
                      onChange={e => setSaleItems(items => items.map((it, i) => i === idx ? { ...it, salePrice: e.target.value } : it))}
                      placeholder="Ціна акції"
                      className="w-32 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none" />
                    <button onClick={() => setSaleItems(i => i.filter((_, j) => j !== idx))}
                      className="text-slate-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50">
                <Check className="h-4 w-4" />
                {saving ? 'Збереження...' : 'Зберегти'}
              </button>
              <button onClick={() => setCreating(false)}
                className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300">
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {sales.length === 0 && !creating ? (
        <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm border border-slate-100">
          <Zap className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-medium text-slate-500">Немає флеш-розпродажів</p>
          <p className="mt-1 text-sm text-slate-400">Створіть перший флеш-розпродаж з таймером зворотного відліку</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map(sale => (
            <div key={sale.id} className="rounded-[2rem] bg-white p-5 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                    <Zap className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-dark">{sale.name}</h3>
                      {statusBadge(sale)}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {fmt(sale.startsAt)} — {fmt(sale.endsAt)}
                      </span>
                      <span>{sale.products.length} товарів</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => handleToggle(sale)}
                    className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-medium transition ${sale.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {sale.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {sale.isActive ? 'Вкл' : 'Викл'}
                  </button>
                  <button onClick={() => openEdit(sale)}
                    className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:border-primary hover:text-primary transition">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(sale.id)}
                    className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:border-red-300 hover:text-red-500 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {sale.products.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {sale.products.slice(0, 5).map(p => (
                    <span key={p.productId} className="rounded-xl bg-slate-50 px-3 py-1 text-xs text-slate-600">
                      {p.product?.name} → {p.salePrice} грн
                    </span>
                  ))}
                  {sale.products.length > 5 && (
                    <span className="rounded-xl bg-slate-50 px-3 py-1 text-xs text-slate-400">
                      +{sale.products.length - 5} ще
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
