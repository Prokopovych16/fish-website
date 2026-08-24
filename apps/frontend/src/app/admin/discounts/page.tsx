'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Tag, Check, X, Trash2 } from 'lucide-react';
import api from '@/lib/api';

type Discount = {
  id: string;
  code: string;
  description?: string | null;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'GIFT_PRODUCT';
  value: number;
  minOrderAmount?: number | null;
  maxUsageCount?: number | null;
  maxUsagePerUser?: number | null;
  isActive: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
};

type ProductOption = { id: string; name: string };

type CategoryOption = { id: string; name: string };

type DiscountForm = {
  code: string;
  description: string;
  type: Discount['type'];
  value: string;
  minOrderAmount: string;
  maxUsageCount: string;
  maxUsagePerUser: string;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
};

const initialForm: DiscountForm = {
  code: '',
  description: '',
  type: 'PERCENTAGE',
  value: '0',
  minOrderAmount: '',
  maxUsageCount: '',
  maxUsagePerUser: '',
  isActive: true,
  startsAt: '',
  expiresAt: '',
};

const discountTypeLabels: Record<Discount['type'], string> = {
  PERCENTAGE: 'Відсоткова',
  FIXED_AMOUNT: 'Фіксована сума',
  FREE_SHIPPING: 'Безкоштовна доставка',
  GIFT_PRODUCT: 'Подарунковий товар',
};

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<DiscountForm>(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/discounts?limit=100');
      setDiscounts(response.data.data || []);
    } catch (fetchError) {
      console.error('Discounts load error', fetchError);
      setError('Не вдалося завантажити знижки.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

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
      if (!form.code.trim() || Number(form.value) < 0) {
        setError('Вкажіть код та значення знижки.');
        return;
      }

      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxUsageCount: form.maxUsageCount ? Number(form.maxUsageCount) : undefined,
        maxUsagePerUser: form.maxUsagePerUser ? Number(form.maxUsagePerUser) : undefined,
        isActive: form.isActive,
        startsAt: form.startsAt || undefined,
        expiresAt: form.expiresAt || undefined,
      };

      if (selectedId) {
        await api.patch(`/discounts/${selectedId}`, payload);
        setMessage('Знижку оновлено');
      } else {
        await api.post('/discounts', payload);
        setMessage('Знижку створено');
      }

      await loadDiscounts();
      resetForm();
    } catch (submitError: any) {
      setError(submitError.response?.data?.message || 'Помилка збереження знижки.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (discount: Discount) => {
    setSelectedId(discount.id);
    setForm({
      code: discount.code,
      description: discount.description || '',
      type: discount.type,
      value: discount.value.toString(),
      minOrderAmount: discount.minOrderAmount?.toString() || '',
      maxUsageCount: discount.maxUsageCount?.toString() || '',
      maxUsagePerUser: discount.maxUsagePerUser?.toString() || '',
      isActive: discount.isActive,
      startsAt: discount.startsAt ? discount.startsAt.slice(0, 10) : '',
      expiresAt: discount.expiresAt ? discount.expiresAt.slice(0, 10) : '',
    });
    setMessage('');
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити знижку?')) return;
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.delete(`/discounts/${id}`);
      setMessage('Знижку видалено');
      await loadDiscounts();
      if (selectedId === id) resetForm();
    } catch (deleteError: any) {
      setError(deleteError.response?.data?.message || 'Не вдалося видалити знижку.');
    } finally {
      setSaving(false);
    }
  };

  const sortedDiscounts = useMemo(() => [...discounts].sort((a, b) => a.code.localeCompare(b.code)), [discounts]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Знижки</p>
            <h2 className="mt-3 text-3xl font-semibold text-dark">Промокоди та акції</h2>
            <p className="mt-2 text-slate-600">Створюйте знижки з умовами, датами та лімітами використання.</p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white transition hover:bg-primary-light"
          >
            <Plus className="h-4 w-4" /> {selectedId ? 'Створити нову знижку' : 'Нова знижка'}
          </button>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Код знижки
                <input
                  value={form.code}
                  onChange={(event) => setForm({ ...form, code: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="SUMMER2026"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Тип знижки
                <select
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value as Discount['type'] })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                >
                  {Object.entries(discountTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-700">
                Значення
                <input
                  value={form.value}
                  onChange={(event) => setForm({ ...form, value: event.target.value })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="10"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Мін. сума
                <input
                  value={form.minOrderAmount}
                  onChange={(event) => setForm({ ...form, minOrderAmount: event.target.value })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Ліміт використань
                <input
                  value={form.maxUsageCount}
                  onChange={(event) => setForm({ ...form, maxUsageCount: event.target.value })}
                  type="number"
                  min="1"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="10"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-700">
                Ліміт на користувача
                <input
                  value={form.maxUsagePerUser}
                  onChange={(event) => setForm({ ...form, maxUsagePerUser: event.target.value })}
                  type="number"
                  min="1"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="1"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Початок дії
                <input
                  value={form.startsAt}
                  onChange={(event) => setForm({ ...form, startsAt: event.target.value })}
                  type="date"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Кінець дії
                <input
                  value={form.expiresAt}
                  onChange={(event) => setForm({ ...form, expiresAt: event.target.value })}
                  type="date"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              Опис
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="w-full min-h-[120px] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                placeholder="Опис промокоду або умови застосування"
              />
            </label>

            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                className="h-4 w-4 text-primary"
              />
              Активна
            </label>

            {error && <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            {message && <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check className="h-4 w-4" /> {selectedId ? 'Оновити знижку' : 'Створити знижку'}
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
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Усі промокоди</p>
              <p className="mt-3 text-3xl font-semibold text-dark">{discounts.length}</p>
              <p className="mt-2 text-sm text-slate-500">Оновіть список після зміни або додайте новий промокод.</p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="p-6 text-center text-slate-500">Завантаження знижок...</div>
              ) : sortedDiscounts.length ? (
                <div className="divide-y divide-slate-200">
                  {sortedDiscounts.map((discount) => (
                    <div key={discount.id} className="p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-slate-500">{discount.code}</p>
                          <h3 className="mt-1 text-xl font-semibold text-dark">{discountTypeLabels[discount.type]}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                          <span className={discount.isActive ? 'rounded-full bg-emerald-50 px-3 py-1 text-emerald-700' : 'rounded-full bg-slate-100 px-3 py-1 text-slate-600'}>
                            {discount.isActive ? 'Активна' : 'Неактивна'}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{discount.value}{discount.type === 'PERCENTAGE' ? '%' : '₴'}</span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <p className="text-sm text-slate-500">{discount.description || 'Опис відсутній'}</p>
                        <p className="text-sm text-slate-500">
                          Мін. сума: {discount.minOrderAmount ? `₴${discount.minOrderAmount}` : 'немає'}{' '}
                          · Ліміт: {discount.maxUsageCount ?? '∞'} · /клієнт: {discount.maxUsagePerUser ?? '∞'}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span>Початок: {discount.startsAt ? new Date(discount.startsAt).toLocaleDateString('uk-UA') : '—'}</span>
                        <span>Кінець: {discount.expiresAt ? new Date(discount.expiresAt).toLocaleDateString('uk-UA') : '—'}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(discount)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:border-primary/40"
                        >
                          <Pencil className="h-4 w-4" /> Редагувати
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(discount.id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" /> Видалити
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-slate-500">Промокодів ще немає.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
