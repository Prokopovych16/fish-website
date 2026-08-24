'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import api from '@/lib/api';

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isMain: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: string | number;
  oldPrice: string | number | null;
  discountPercent: number | null;
  stock: number;
  sku: string | null;
  unit: string;
  weight: string | number | null;
  origin: string | null;
  catchMethod: string | null;
  storageConditions: string | null;
  expiryDays: number | null;
  composition: string | null;
  calories: string | number | null;
  proteins: string | number | null;
  fats: string | number | null;
  carbs: string | number | null;
  isHaccp: boolean;
  badges: string[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  categoryId: string;
  category: { id: string; name: string } | null;
  images: ProductImage[];
  tags: { tag: { id: string; name: string; slug: string } }[];
};

type CategoryOption = { id: string; name: string };

const BADGES = ['Новинка', 'Хіт', 'Акція', 'Пісний'];
const UNITS = ['кг', 'шт', 'л', 'уп', 'г'];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    oldPrice: '',
    stock: '',
    sku: '',
    unit: 'кг',
    categoryId: '',
    tags: '',
    badges: [] as string[],
    isActive: true,
    isFeatured: false,
    isHaccp: true,
    weight: '',
    origin: '',
    catchMethod: '',
    storageConditions: '',
    expiryDays: '',
    composition: '',
    calories: '',
    proteins: '',
    fats: '',
    carbs: '',
    sortOrder: '0',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  const loadProduct = async () => {
    try {
      const [productRes, catRes] = await Promise.all([
        api.get(`/products/by-id/${id}`),
        api.get('/categories/options/flat'),
      ]);
      const p: Product = productRes.data;
      setProduct(p);
      setCategories(catRes.data || []);
      setForm({
        name: p.name,
        slug: p.slug,
        description: p.description ?? '',
        shortDescription: p.shortDescription ?? '',
        price: String(p.price),
        oldPrice: p.oldPrice != null ? String(p.oldPrice) : '',
        stock: String(p.stock),
        sku: p.sku ?? '',
        unit: p.unit ?? 'кг',
        categoryId: p.categoryId,
        tags: p.tags?.map((t) => t.tag.name).join(', ') ?? '',
        badges: p.badges ?? [],
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        isHaccp: p.isHaccp,
        weight: p.weight != null ? String(p.weight) : '',
        origin: p.origin ?? '',
        catchMethod: p.catchMethod ?? '',
        storageConditions: p.storageConditions ?? '',
        expiryDays: p.expiryDays != null ? String(p.expiryDays) : '',
        composition: p.composition ?? '',
        calories: p.calories != null ? String(p.calories) : '',
        proteins: p.proteins != null ? String(p.proteins) : '',
        fats: p.fats != null ? String(p.fats) : '',
        carbs: p.carbs != null ? String(p.carbs) : '',
        sortOrder: String(p.sortOrder ?? 0),
        seoTitle: p.seoTitle ?? '',
        seoDescription: p.seoDescription ?? '',
        seoKeywords: p.seoKeywords ?? '',
      });
    } catch {
      setError('Не вдалося завантажити товар.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.patch(`/products/${id}`, {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description || undefined,
        shortDescription: form.shortDescription || undefined,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        stock: Number(form.stock),
        sku: form.sku || undefined,
        unit: form.unit,
        categoryId: form.categoryId,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        badges: form.badges,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        isHaccp: form.isHaccp,
        weight: form.weight ? Number(form.weight) : undefined,
        origin: form.origin || undefined,
        catchMethod: form.catchMethod || undefined,
        storageConditions: form.storageConditions || undefined,
        expiryDays: form.expiryDays ? Number(form.expiryDays) : undefined,
        composition: form.composition || undefined,
        calories: form.calories ? Number(form.calories) : undefined,
        proteins: form.proteins ? Number(form.proteins) : undefined,
        fats: form.fats ? Number(form.fats) : undefined,
        carbs: form.carbs ? Number(form.carbs) : undefined,
        sortOrder: Number(form.sortOrder),
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        seoKeywords: form.seoKeywords || undefined,
      });
      setMessage('Товар збережено');
      await loadProduct();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Помилка збереження.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImages = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        await api.post(`/products/${id}/images`, {
          url: uploadRes.data.url,
          alt: form.name,
          isMain: product?.images.length === 0,
        });
      }
      await loadProduct();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Помилка завантаження фото.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Видалити це зображення?')) return;
    try {
      await api.delete(`/products/${id}/images/${imageId}`);
      await loadProduct();
    } catch {
      setError('Не вдалося видалити зображення.');
    }
  };

  const handleSetMain = async (imageId: string) => {
    try {
      await api.patch(`/products/${id}/images/${imageId}/main`);
      await loadProduct();
    } catch {
      setError('Не вдалося встановити головне зображення.');
    }
  };

  const toggleBadge = (badge: string) => {
    setForm((prev) => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter((b) => b !== badge)
        : [...prev.badges, badge],
    }));
  };

  const field = (
    label: string,
    key: keyof typeof form,
    opts?: { type?: string; placeholder?: string; rows?: number },
  ) => {
    const val = form[key] as string;
    const set = (v: string) => setForm((p) => ({ ...p, [key]: v }));
    if (opts?.rows) {
      return (
        <label className="flex flex-col gap-1.5 text-sm text-slate-700">
          {label}
          <textarea
            value={val}
            onChange={(e) => set(e.target.value)}
            rows={opts.rows}
            placeholder={opts?.placeholder}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none resize-none"
          />
        </label>
      );
    }
    return (
      <label className="flex flex-col gap-1.5 text-sm text-slate-700">
        {label}
        <input
          value={val}
          onChange={(e) => set(e.target.value)}
          type={opts?.type || 'text'}
          placeholder={opts?.placeholder}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
        />
      </label>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-3xl bg-red-50 p-8 text-center text-red-600">
        Товар не знайдено.{' '}
        <button onClick={() => router.back()} className="underline">
          Назад
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/products')}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Редагування</p>
            <h2 className="mt-1 text-2xl font-semibold text-dark">{product.name}</h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Basic info */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-base font-semibold text-dark">Основна інформація</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('Назва товару *', 'name', { placeholder: 'Свіжа сьомга' })}
              {field('Slug (URL)', 'slug', { placeholder: 'svizha-somga' })}
            </div>
            <div className="mt-4">
              {field('Короткий опис', 'shortDescription', {
                rows: 2,
                placeholder: 'Один-два речення для картки товару',
              })}
            </div>
            <div className="mt-4">
              {field('Повний опис', 'description', {
                rows: 5,
                placeholder: 'Детальний опис товару...',
              })}
            </div>
          </section>

          {/* Pricing & stock */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-base font-semibold text-dark">Ціна та наявність</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {field('Ціна *', 'price', { type: 'number', placeholder: '1200' })}
              {field('Стара ціна', 'oldPrice', { type: 'number', placeholder: '1500' })}
              {field('Кількість *', 'stock', { type: 'number', placeholder: '10' })}
              <label className="flex flex-col gap-1.5 text-sm text-slate-700">
                Одиниця
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {field('Артикул (SKU)', 'sku', { placeholder: 'FISH-001' })}
              {field('Сортування', 'sortOrder', { type: 'number', placeholder: '0' })}
            </div>
          </section>

          {/* Attributes */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-base font-semibold text-dark">Характеристики</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {field('Вага (кг)', 'weight', { type: 'number', placeholder: '1.5' })}
              {field('Країна походження', 'origin', { placeholder: 'Норвегія' })}
              {field('Метод вилову', 'catchMethod', { placeholder: 'Атлантичний океан' })}
              {field('Термін зберігання (діб)', 'expiryDays', { type: 'number', placeholder: '7' })}
              {field('Умови зберігання', 'storageConditions', { placeholder: 'від 0 до +4°C' })}
            </div>
            <div className="mt-4">
              {field('Склад', 'composition', {
                rows: 2,
                placeholder: 'Лосось атлантичний (Salmo salar)...',
              })}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              {field('Калорії (ккал)', 'calories', { type: 'number', placeholder: '208' })}
              {field('Білки (г)', 'proteins', { type: 'number', placeholder: '20' })}
              {field('Жири (г)', 'fats', { type: 'number', placeholder: '13' })}
              {field('Вуглеводи (г)', 'carbs', { type: 'number', placeholder: '0' })}
            </div>
          </section>

          {/* SEO */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-base font-semibold text-dark">SEO</h3>
            <div className="space-y-4">
              {field('SEO заголовок', 'seoTitle', { placeholder: 'Свіжа сьомга купити онлайн' })}
              {field('SEO опис', 'seoDescription', {
                rows: 3,
                placeholder: 'Свіжа охолоджена сьомга з Норвегії...',
              })}
              {field('SEO ключові слова', 'seoKeywords', {
                placeholder: 'сьомга, свіжа риба, купити',
              })}
            </div>
          </section>

          {/* Messages */}
          {error && (
            <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}
          {message && (
            <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {saving ? 'Збереження...' : 'Зберегти зміни'}
          </button>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Images */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-dark">Зображення</h3>

            <div className="grid grid-cols-2 gap-3">
              {product.images.map((img) => (
                <div key={img.id} className="group relative overflow-hidden rounded-2xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt ?? ''}
                    className="h-28 w-full object-cover"
                  />
                  {img.isMain && (
                    <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                      Головне
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                    {!img.isMain && (
                      <button
                        type="button"
                        onClick={() => handleSetMain(img.id)}
                        title="Зробити головним"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-amber-500 hover:bg-white"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      title="Видалити"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 hover:bg-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-primary hover:text-primary disabled:opacity-60"
              >
                {uploading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <>
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">Додати фото</span>
                  </>
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleUploadImages(e.target.files)}
            />
            <p className="mt-3 text-xs text-slate-400">
              JPEG, PNG, WebP — до 5MB. Наведи на фото щоб видалити або зробити головним.
            </p>
          </section>

          {/* Category */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-dark">Категорія</h3>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
            >
              <option value="">Оберіть категорію</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </section>

          {/* Badges */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-dark">Бейджі</h3>
            <div className="flex flex-wrap gap-2">
              {BADGES.map((badge) => (
                <button
                  key={badge}
                  type="button"
                  onClick={() => toggleBadge(badge)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    form.badges.includes(badge)
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {badge}
                </button>
              ))}
            </div>
          </section>

          {/* Tags */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-dark">Теги</h3>
            {field('', 'tags', { placeholder: 'хіт, новинка, лосось' })}
            <p className="mt-2 text-xs text-slate-400">Теги через кому</p>
          </section>

          {/* Visibility */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-dark">Видимість</h3>
            <div className="space-y-3">
              {[
                { key: 'isActive' as const, label: 'Активний (публічний)' },
                { key: 'isFeatured' as const, label: 'Хіт продажів' },
                { key: 'isHaccp' as const, label: 'HACCP сертифікат' },
              ].map(({ key, label }) => (
                <label key={key} className="flex cursor-pointer items-center gap-3">
                  <div
                    onClick={() => setForm((p) => ({ ...p, [key]: !p[key] }))}
                    className={`relative h-6 w-11 rounded-full transition ${
                      form[key] ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        form[key] ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
