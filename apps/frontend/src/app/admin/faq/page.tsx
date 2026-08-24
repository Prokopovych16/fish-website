'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ListChecks, Check, X } from 'lucide-react';
import api from '@/lib/api';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  sortOrder: number;
  isActive: boolean;
};

type FaqForm = {
  question: string;
  answer: string;
  category: string;
  sortOrder: string;
  isActive: boolean;
};

const initialForm: FaqForm = {
  question: '',
  answer: '',
  category: '',
  sortOrder: '0',
  isActive: true,
};

export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadFaq = async () => {
    setLoading(true);
    try {
      const response = await api.get('/faq?limit=100');
      setItems(response.data || []);
    } catch (err) {
      console.error('FAQ fetch error', err);
      setError('Не вдалося завантажити FAQ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaq();
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

    if (!form.question || !form.answer) {
      setError('Вкажіть питання та відповідь.');
      setSaving(false);
      return;
    }

    const payload = {
      question: form.question,
      answer: form.answer,
      category: form.category || undefined,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    };

    try {
      if (selectedId) {
        await api.patch(`/faq/${selectedId}`, payload);
        setMessage('FAQ оновлено');
      } else {
        await api.post('/faq', payload);
        setMessage('FAQ створено');
      }
      await loadFaq();
      resetForm();
    } catch (submitError: any) {
      setError(submitError.response?.data?.message || 'Не вдалося зберегти FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: FaqItem) => {
    setSelectedId(item.id);
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category || '',
      sortOrder: item.sortOrder.toString(),
      isActive: item.isActive,
    });
    setMessage('');
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити FAQ?')) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.delete(`/faq/${id}`);
      setMessage('FAQ видалено');
      await loadFaq();
      if (selectedId === id) resetForm();
    } catch (deleteError: any) {
      setError(deleteError.response?.data?.message || 'Не вдалося видалити FAQ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold text-dark">Керування питаннями</h2>
            <p className="mt-2 text-slate-600">Створюйте та редагуйте часто задавані питання для сайту.</p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white transition hover:bg-primary-light"
          >
            <Plus className="h-4 w-4" /> {selectedId ? 'Нове питання' : 'Додати питання'}
          </button>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <label className="space-y-2 text-sm text-slate-700">
              Питання
              <input
                value={form.question}
                onChange={(event) => setForm({ ...form, question: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                placeholder="Який термін зберігання?"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Відповідь
              <textarea
                value={form.answer}
                onChange={(event) => setForm({ ...form, answer: event.target.value })}
                className="w-full min-h-[140px] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                placeholder="Ми зберігаємо товар в холодильнику до 3 днів..."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-700">
                Категорія
                <input
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="Доставка"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Порядок
                <input
                  value={form.sortOrder}
                  onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                />
              </label>
              <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                  className="h-4 w-4 text-primary"
                />
                Активний
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
                <Check className="h-4 w-4" /> {selectedId ? 'Оновити FAQ' : 'Створити FAQ'}
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
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">FAQ</p>
              <p className="mt-3 text-3xl font-semibold text-dark">{items.length}</p>
              <p className="mt-2 text-sm text-slate-500">Питань у базі.</p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="p-6 text-center text-slate-500">Завантаження...</div>
              ) : items.length ? (
                <div className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm text-slate-500">{item.category || 'Без категорії'}</p>
                          <h3 className="text-xl font-semibold text-dark">{item.question}</h3>
                          <p className="mt-2 text-slate-700">{item.answer}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                          <span className={item.isActive ? 'rounded-full bg-emerald-50 px-3 py-1 text-emerald-700' : 'rounded-full bg-slate-100 px-3 py-1 text-slate-600'}>
                            {item.isActive ? 'Активний' : 'Неактивний'}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">Порядок {item.sortOrder}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:border-primary/40"
                        >
                          <Pencil className="h-4 w-4" /> Редагувати
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" /> Видалити
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-slate-500">FAQ ще немає.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
