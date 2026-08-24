'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ImageIcon, Check, X } from 'lucide-react';
import api from '@/lib/api';

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  image: string;
  imageMobile?: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

type BannerForm = {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  imageMobile: string;
  sortOrder: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
};

const initialForm: BannerForm = {
  title: '',
  subtitle: '',
  buttonText: '',
  buttonLink: '',
  image: '',
  imageMobile: '',
  sortOrder: '0',
  isActive: true,
  startsAt: '',
  endsAt: '',
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadBanners = async () => {
    setLoading(true);
    try {
      const response = await api.get('/banners?includeInactive=true');
      setBanners(response.data || []);
    } catch (err) {
      console.error('Banners fetch error', err);
      setError('Не вдалося завантажити банери.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
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

    if (!form.title || !form.image) {
      setError('Вкажіть назву та основне зображення.');
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title,
      subtitle: form.subtitle || undefined,
      buttonText: form.buttonText || undefined,
      buttonLink: form.buttonLink || undefined,
      image: form.image,
      imageMobile: form.imageMobile || undefined,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
    };

    try {
      if (selectedId) {
        await api.patch(`/banners/${selectedId}`, payload);
        setMessage('Банер оновлено');
      } else {
        await api.post('/banners', payload);
        setMessage('Банер створено');
      }
      await loadBanners();
      resetForm();
    } catch (submitError: any) {
      setError(submitError.response?.data?.message || 'Не вдалося зберегти банер.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setSelectedId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      buttonText: banner.buttonText || '',
      buttonLink: banner.buttonLink || '',
      image: banner.image,
      imageMobile: banner.imageMobile || '',
      sortOrder: banner.sortOrder.toString(),
      isActive: banner.isActive,
      startsAt: banner.startsAt ? banner.startsAt.slice(0, 10) : '',
      endsAt: banner.endsAt ? banner.endsAt.slice(0, 10) : '',
    });
    setMessage('');
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити банер?')) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.delete(`/banners/${id}`);
      setMessage('Банер видалено');
      await loadBanners();
      if (selectedId === id) resetForm();
    } catch (deleteError: any) {
      setError(deleteError.response?.data?.message || 'Не вдалося видалити банер.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Банери</p>
            <h2 className="mt-3 text-3xl font-semibold text-dark">Управління банерами</h2>
            <p className="mt-2 text-slate-600">Додавання і редагування головних банерів сайту.</p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white transition hover:bg-primary-light"
          >
            <Plus className="h-4 w-4" /> {selectedId ? 'Новий банер' : 'Додати банер'}
          </button>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Заголовок
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="Святкові пропозиції"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Підзаголовок
                <input
                  value={form.subtitle}
                  onChange={(event) => setForm({ ...form, subtitle: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="Свіжа риба щодня"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Кнопка текст
                <input
                  value={form.buttonText}
                  onChange={(event) => setForm({ ...form, buttonText: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="Переглянути каталог"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Посилання кнопки
                <input
                  value={form.buttonLink}
                  onChange={(event) => setForm({ ...form, buttonLink: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="/catalog"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Зображення
                <div className="relative rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <input
                    value={form.image}
                    onChange={(event) => setForm({ ...form, image: event.target.value })}
                    className="w-full bg-transparent text-sm text-slate-900 focus:outline-none"
                    placeholder="https://..."
                  />
                  <ImageIcon className="absolute right-4 top-4 h-4 w-4 text-slate-400" />
                </div>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Мобільне зображення
                <input
                  value={form.imageMobile}
                  onChange={(event) => setForm({ ...form, imageMobile: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="https://..."
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
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
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Початок
                  <input
                    value={form.startsAt}
                    onChange={(event) => setForm({ ...form, startsAt: event.target.value })}
                    type="date"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Кінець
                  <input
                    value={form.endsAt}
                    onChange={(event) => setForm({ ...form, endsAt: event.target.value })}
                    type="date"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  />
                </label>
              </div>
            </div>

            {error && <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            {message && <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check className="h-4 w-4" /> {selectedId ? 'Оновити банер' : 'Створити банер'}
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
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Банери</p>
              <p className="mt-3 text-3xl font-semibold text-dark">{banners.length}</p>
              <p className="mt-2 text-sm text-slate-500">Всього банерів у системі.</p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="p-6 text-center text-slate-500">Завантаження...</div>
              ) : banners.length ? (
                <div className="divide-y divide-slate-200">
                  {banners.map((banner) => (
                    <div key={banner.id} className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-slate-500">{banner.title}</p>
                          <h3 className="mt-1 text-xl font-semibold text-dark">{banner.subtitle || 'Без підзаголовку'}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                          <span className={banner.isActive ? 'rounded-full bg-emerald-50 px-3 py-1 text-emerald-700' : 'rounded-full bg-slate-100 px-3 py-1 text-slate-600'}>
                            {banner.isActive ? 'Активний' : 'Неактивний'}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">Порядок {banner.sortOrder}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(banner)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:border-primary/40"
                        >
                          <Pencil className="h-4 w-4" /> Редагувати
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(banner.id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" /> Видалити
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-slate-500">Банерів ще немає.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
