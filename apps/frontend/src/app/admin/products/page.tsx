'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Check, X, Search, ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  category: { id: string; name: string } | null;
};

type FullProduct = Product & {
  description?: string | null;
  unit: string;
  tags?: { tag: { name: string } }[];
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
};

type ProductForm = {
  name: string;
  slug: string;
  price: string;
  oldPrice: string;
  stock: string;
  categoryId: string;
  tags: string;
  description: string;
  unit: string;
  isActive: boolean;
  isFeatured: boolean;
};

const initialForm: ProductForm = {
  name: '',
  slug: '',
  price: '',
  oldPrice: '',
  stock: '1',
  categoryId: '',
  tags: '',
  description: '',
  unit: 'кг',
  isActive: true,
  isFeatured: false,
};

const LIMIT = 20;

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'inactive'>('');

  const loadProducts = useCallback(async (p: number, q: string, cat: string, status: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), page: String(p), onlyActive: 'false', minimal: 'true' });
      if (q) params.set('search', q);
      if (cat) params.set('categoryId', cat);
      if (status === 'active') params.set('onlyActive', 'true');
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data ?? []);
      setTotal(res.data.pagination?.total ?? 0);
    } catch {
      setError('Не вдалося завантажити товари.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories/options/flat');
      setCategories(res.data ?? []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts(page, search, categoryFilter, statusFilter);
  }, [page, search, categoryFilter, statusFilter, loadProducts]);

  const pages = Math.ceil(total / LIMIT);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const resetForm = () => {
    setSelectedId(null);
    setForm(initialForm);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        name: form.name,
        slug: form.slug || undefined,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        stock: Number(form.stock),
        categoryId: form.categoryId,
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        description: form.description || undefined,
        unit: form.unit,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      };

      if (!payload.name || !payload.price || !payload.categoryId) {
        setError('Будь ласка, заповніть назву, ціну та категорію.');
        setSaving(false);
        return;
      }

      if (selectedId) {
        await api.patch(`/products/${selectedId}`, payload);
        setMessage('Товар оновлено успішно');
      } else {
        await api.post('/products', payload);
        setMessage('Товар створено успішно');
      }

      await loadProducts(page, search, categoryFilter, statusFilter);
      resetForm();
    } catch (submitError: any) {
      setError(submitError.response?.data?.message || 'Помилка збереження товару.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (product: Product) => {
    setSelectedId(product.id);
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await api.get<FullProduct>(`/products/by-id/${product.id}`);
      const p = res.data;
      setForm({
        name: p.name,
        slug: p.slug,
        price: p.price.toString(),
        oldPrice: p.oldPrice?.toString() ?? '',
        stock: p.stock.toString(),
        categoryId: p.category?.id || '',
        tags: p.tags?.map((t) => t.tag.name).join(', ') ?? '',
        description: p.description ?? '',
        unit: p.unit ?? 'кг',
        isActive: p.isActive,
        isFeatured: p.isFeatured,
      });
    } catch {
      setForm({
        name: product.name,
        slug: product.slug,
        price: product.price.toString(),
        oldPrice: product.oldPrice?.toString() ?? '',
        stock: product.stock.toString(),
        categoryId: product.category?.id || '',
        tags: '',
        description: '',
        unit: 'кг',
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити товар? Цю дію не можна скасувати.')) return;
    setSaving(true);
    try {
      await api.delete(`/products/${id}`);
      setMessage('Товар видалено');
      await loadProducts(page, search, categoryFilter, statusFilter);
      if (selectedId === id) resetForm();
    } catch (deleteError: any) {
      setError(deleteError.response?.data?.message || 'Не вдалося видалити товар.');
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const handleStatusChange = (val: '' | 'active' | 'inactive') => {
    setStatusFilter(val);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Create/Edit form */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Товари</p>
            <h2 className="mt-3 text-3xl font-semibold text-dark">Управління каталогом</h2>
            <p className="mt-2 text-slate-600">Створюйте, редагуйте та видаляйте товари безпосередньо в адмінці.</p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {selectedId ? 'Створити новий товар' : 'Новий товар'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Назва товару
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="Свіжа сьомга"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Slug
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="svizha-somaga"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-700">
                Ціна
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="1200"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Стара ціна
                <input
                  value={form.oldPrice}
                  onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="1400"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Кількість
                <input
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="10"
                  type="number"
                  min="0"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Категорія
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                >
                  <option value="">Оберіть категорію</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Одиниця виміру
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                >
                  {['кг', 'шт', 'л', 'уп', 'г'].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              Короткий опис
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none resize-none"
                placeholder="Короткий опис товару..."
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              Теги (через кому)
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                placeholder="Новинка, Хіт продажу"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                Активний
              </label>
              <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                Хіт продажів
              </label>
            </div>

            {error && <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            {message && <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-white transition hover:bg-primary/90 disabled:opacity-60"
              >
                <Check className="h-4 w-4" /> {selectedId ? 'Оновити товар' : 'Створити товар'}
              </button>
              {selectedId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-slate-700 transition hover:border-primary/40"
                >
                  <X className="h-4 w-4" /> Скасувати
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Порада</p>
              <h3 className="mt-2 text-xl font-semibold text-dark">Швидке додавання</h3>
              <p className="mt-3 text-sm text-slate-600">Заповніть мінімальні поля та натисніть «Створити товар». Потім натисніть <strong>«Деталі»</strong> — там доступні фото, КБЖВ, SEO та всі поля.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Категорій</p>
              <p className="mt-4 text-3xl font-semibold text-dark">{categories.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Товарів всього</p>
              <p className="mt-4 text-3xl font-semibold text-dark">{total}</p>
            </div>
          </div>
        </form>
      </div>

      {/* Products list */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-dark">Список товарів</h3>
            <p className="text-sm text-slate-500">Сторінка {page} · {total} товарів</p>
          </div>
          <button
            onClick={() => loadProducts(page, search, categoryFilter, statusFilter)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 transition hover:border-primary hover:text-primary"
          >
            <RefreshCw className="h-4 w-4" /> Оновити
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Пошук товарів..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
          >
            <option value="">Всі категорії</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as '' | 'active' | 'inactive')}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
          >
            <option value="">Усі статуси</option>
            <option value="active">Активні</option>
            <option value="inactive">Вимкнені</option>
          </select>
          <button
            onClick={handleSearch}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Знайти
          </button>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Назва</th>
                    <th className="px-6 py-4 font-medium hidden md:table-cell">Категорія</th>
                    <th className="px-6 py-4 font-medium">Ціна</th>
                    <th className="px-6 py-4 font-medium hidden sm:table-cell">Статус</th>
                    <th className="px-6 py-4 font-medium">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-dark line-clamp-1">{product.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">/{product.slug}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 hidden md:table-cell">
                        {product.category?.name ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-dark">₴{Number(product.price).toFixed(0)}</p>
                        {product.stock === 0 && (
                          <p className="text-xs text-red-500 mt-0.5">Немає в наявності</p>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {product.isActive ? 'Активний' : 'Вимкнено'}
                        </span>
                        {product.isFeatured && (
                          <span className="ml-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">Хіт</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/products/${product.id}`)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary transition hover:bg-primary/10"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Деталі
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:border-primary/40 hover:text-primary"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Ред.
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!products.length && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        Товари не знайдено
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
                <span>
                  {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} з {total}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 hover:border-primary hover:text-primary transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    const p = pages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= pages - 3 ? pages - 6 + i : page - 3 + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`rounded-xl px-3 py-2 transition ${
                          p === page
                            ? 'bg-primary text-white'
                            : 'border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 hover:border-primary hover:text-primary transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
