'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Star, Check, X, Trash2, ChevronLeft, ChevronRight, EyeOff, Eye } from 'lucide-react';
import api from '@/lib/api';

type Review = {
  id: string;
  productId: string;
  product?: { id: string; name: string };
  authorName: string;
  authorCity?: string | null;
  authorAvatar?: string | null;
  rating: number;
  title?: string | null;
  text: string;
  images: string[];
  isVerified: boolean;
  isFake: boolean;
  status: 'PENDING' | 'PUBLISHED' | 'HIDDEN';
  adminNote?: string | null;
  sortOrder: number;
};

type ProductOption = { id: string; name: string };

type ReviewForm = {
  productId: string;
  authorName: string;
  authorCity: string;
  authorAvatar: string;
  rating: string;
  title: string;
  text: string;
  images: string;
  status: Review['status'];
  isVerified: boolean;
  isFake: boolean;
  adminNote: string;
  sortOrder: string;
};

const initialForm: ReviewForm = {
  productId: '',
  authorName: '',
  authorCity: '',
  authorAvatar: '',
  rating: '5',
  title: '',
  text: '',
  images: '',
  status: 'PENDING',
  isVerified: false,
  isFake: false,
  adminNote: '',
  sortOrder: '0',
};

const statusLabels: Record<Review['status'], string> = {
  PENDING: 'Очікує',
  PUBLISHED: 'Опубліковано',
  HIDDEN: 'Приховано',
};

const LIMIT = 15;

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Review['status'] | ''>('');
  const [form, setForm] = useState<ReviewForm>(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadReviews = useCallback(async (p: number, status: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (status) params.set('status', status);
      const response = await api.get(`/reviews?${params}`);
      setReviews(response.data.data || []);
      setTotal(response.data.pagination?.total ?? 0);
    } catch {
      setError('Не вдалося завантажити відгуки.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const response = await api.get('/products?limit=200&onlyActive=false');
      setProducts(response.data.data || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    loadReviews(page, filterStatus);
  }, [page, filterStatus, loadReviews]);

  const pages = Math.ceil(total / LIMIT);

  const handleStatusChange = (val: Review['status'] | '') => {
    setFilterStatus(val);
    setPage(1);
  };

  const quickSetStatus = async (id: string, status: Review['status']) => {
    try {
      await api.patch(`/reviews/${id}`, { status });
      await loadReviews(page, filterStatus);
    } catch { /* silent */ }
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
      if (!form.productId || !form.authorName || !form.text) {
        setError('Вкажіть товар, ім’я автора та текст відгуку.');
        return;
      }

      const payload = {
        productId: form.productId,
        authorName: form.authorName,
        authorCity: form.authorCity || undefined,
        authorAvatar: form.authorAvatar || undefined,
        rating: Number(form.rating),
        title: form.title || undefined,
        text: form.text,
        images: form.images
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const adminFields = {
        status: form.status,
        isVerified: form.isVerified,
        isFake: form.isFake,
        adminNote: form.adminNote || undefined,
        sortOrder: Number(form.sortOrder),
      };

      if (selectedId) {
        await api.patch(`/reviews/${selectedId}`, { ...payload, ...adminFields });
        setMessage('Відгук оновлено');
      } else {
        await api.post('/reviews', { ...payload, ...adminFields });
        setMessage('Відгук створено');
      }

      await loadReviews(page, filterStatus);
      resetForm();
    } catch (submitError: any) {
      setError(submitError.response?.data?.message || 'Помилка збереження відгуку.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (review: Review) => {
    setSelectedId(review.id);
    setForm({
      productId: review.productId,
      authorName: review.authorName,
      authorCity: review.authorCity || '',
      authorAvatar: review.authorAvatar || '',
      rating: review.rating.toString(),
      title: review.title || '',
      text: review.text,
      images: review.images.join(', '),
      status: review.status,
      isVerified: review.isVerified,
      isFake: review.isFake,
      adminNote: review.adminNote || '',
      sortOrder: review.sortOrder?.toString() || '0',
    });
    setMessage('');
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити відгук?')) return;
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.delete(`/reviews/${id}`);
      setMessage('Відгук видалено');
      await loadReviews(page, filterStatus);
      if (selectedId === id) resetForm();
    } catch (deleteError: any) {
      setError(deleteError.response?.data?.message || 'Не вдалося видалити відгук.');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Усі статуси' },
      { value: 'PENDING', label: 'Очікують' },
      { value: 'PUBLISHED', label: 'Опубліковані' },
      { value: 'HIDDEN', label: 'Приховані' },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Відгуки</p>
            <h2 className="mt-3 text-3xl font-semibold text-dark">Модерація відгуків</h2>
            <p className="mt-2 text-slate-600">Переглядайте нові відгуки, публікуйте їх та додавайте ручні записи.</p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white transition hover:bg-primary-light"
          >
            <Plus className="h-4 w-4" /> {selectedId ? 'Новий відгук' : 'Додати відгук'}
          </button>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Товар
                <select
                  value={form.productId}
                  onChange={(event) => setForm({ ...form, productId: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                >
                  <option value="">Оберіть товар</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Автор
                <input
                  value={form.authorName}
                  onChange={(event) => setForm({ ...form, authorName: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="Ім'я автора"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-700">
                Рейтинг
                <select
                  value={form.rating}
                  onChange={(event) => setForm({ ...form, rating: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} ⭐
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Місто
                <input
                  value={form.authorCity}
                  onChange={(event) => setForm({ ...form, authorCity: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="Київ"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Аватар URL
                <input
                  value={form.authorAvatar}
                  onChange={(event) => setForm({ ...form, authorAvatar: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="https://..."
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Заголовок
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="Чудовий продукт"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Фото (URL, через кому)
                <input
                  value={form.images}
                  onChange={(event) => setForm({ ...form, images: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="https://... , https://..."
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              Текст відгуку
              <textarea
                value={form.text}
                onChange={(event) => setForm({ ...form, text: event.target.value })}
                className="w-full min-h-[140px] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                placeholder="Текст відгуку"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-700">
                Статус
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as Review['status'] })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isVerified}
                  onChange={(event) => setForm({ ...form, isVerified: event.target.checked })}
                  className="h-4 w-4 text-primary"
                />
                Перевірено
              </label>
              <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isFake}
                  onChange={(event) => setForm({ ...form, isFake: event.target.checked })}
                  className="h-4 w-4 text-primary"
                />
                Адмінський
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Нотація менеджера
                <input
                  value={form.adminNote}
                  onChange={(event) => setForm({ ...form, adminNote: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="Службова нотатка"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Порядок сортування
                <input
                  value={form.sortOrder}
                  onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            {error && <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            {message && <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check className="h-4 w-4" /> {selectedId ? 'Оновити відгук' : 'Додати відгук'}
              </button>
              {selectedId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-slate-700 transition hover:border-primary/40"
                >
                  <X className="h-4 w-4" /> Скасувати
                </button>
              ) : null}
            </div>
          </form>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Відгуки</p>
                  <p className="mt-1 text-sm text-slate-600">Всього: {total}</p>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => handleStatusChange(e.target.value as Review['status'] | '')}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                </div>
              ) : reviews.length ? (
                <div className="divide-y divide-slate-100">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-xs text-slate-400 truncate">{review.product?.name || review.productId}</p>
                          <p className="font-semibold text-dark text-sm truncate">
                            {review.authorName}
                            {review.title && <span className="font-normal text-slate-500"> — {review.title}</span>}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                            <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-500" /> {review.rating}</span>
                            <span className={`rounded-full px-2 py-0.5 font-medium ${
                              review.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                              review.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-500'
                            }`}>{statusLabels[review.status]}</span>
                            {review.isVerified && <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-700">✓ Перевірено</span>}
                            {review.isFake && <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-700">Адмін</span>}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-1.5">
                          {review.status !== 'PUBLISHED' && (
                            <button
                              type="button"
                              onClick={() => quickSetStatus(review.id, 'PUBLISHED')}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                            >
                              <Eye className="h-3.5 w-3.5" /> Публікувати
                            </button>
                          )}
                          {review.status !== 'HIDDEN' && (
                            <button
                              type="button"
                              onClick={() => quickSetStatus(review.id, 'HIDDEN')}
                              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                            >
                              <EyeOff className="h-3.5 w-3.5" /> Приховати
                            </button>
                          )}
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(review)}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 transition hover:border-primary hover:text-primary"
                              title="Редагувати"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(review.id)}
                              className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100"
                              title="Видалити"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">{review.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">Відгуків не знайдено</div>
              )}
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600">
                <span>{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} з {total}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 hover:border-primary hover:text-primary transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                    const p = pages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= pages - 2 ? pages - 4 + i : page - 2 + i;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`rounded-xl px-3 py-2 transition ${p === page ? 'bg-primary text-white' : 'border border-slate-200 hover:border-primary hover:text-primary'}`}>
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 hover:border-primary hover:text-primary transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
