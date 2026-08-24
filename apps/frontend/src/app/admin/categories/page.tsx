'use client';

import { useEffect, useState } from 'react';
import { Plus, Folder, Edit3, Trash2, Check, X } from 'lucide-react';
import api from '@/lib/api';

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  isActive: boolean;
  children?: Category[];
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
};

type CategoryTreeItem = {
  category: Category;
  level: number;
};

type CategoryForm = {
  name: string;
  slug: string;
  parentId: string;
  isActive: boolean;
};

const renderCategoryTree = (categories: Category[], level = 0): CategoryTreeItem[] =>
  categories.flatMap((category) => [
    { category, level },
    ...renderCategoryTree(category.children || [], level + 1),
  ]);

const initialForm: CategoryForm = {
  name: '',
  slug: '',
  parentId: '',
  isActive: true,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [treeResponse, optionsResponse] = await Promise.all([
        api.get('/categories?includeInactive=true'),
        api.get('/categories/options/flat'),
      ]);

      setCategories(treeResponse.data || []);
      setCategoryOptions(optionsResponse.data || []);
    } catch (fetchError) {
      console.error('Categories load error', fetchError);
      setError('Не вдалося завантажити категорії.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      if (!form.name) {
        setError('Вкажіть назву категорії.');
        return;
      }

      const payload = {
        name: form.name,
        slug: form.slug || undefined,
        parentId: form.parentId || undefined,
        isActive: form.isActive,
      };

      if (selectedId) {
        await api.patch(`/categories/${selectedId}`, payload);
        setMessage('Категорію оновлено');
      } else {
        await api.post('/categories', payload);
        setMessage('Категорію створено');
      }

      await loadData();
      resetForm();
    } catch (submitError: any) {
      setError(submitError.response?.data?.message || 'Помилка збереження категорії.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || '',
      isActive: category.isActive,
    });
    setMessage('');
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити категорію? Цю дію не можна скасувати.')) {
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.delete(`/categories/${id}`);
      setMessage('Категорію видалено');
      await loadData();
      if (selectedId === id) {
        resetForm();
      }
    } catch (deleteError: any) {
      setError(deleteError.response?.data?.message || 'Не вдалося видалити категорію.');
    } finally {
      setSaving(false);
    }
  };

  const flatCategories = renderCategoryTree(categories);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Категорії</p>
            <h2 className="mt-3 text-3xl font-semibold text-dark">Управління категоріями</h2>
            <p className="mt-2 text-slate-600">Створюйте дерево категорій для сайту, редагуйте slug і стан.</p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white transition hover:bg-primary-light"
          >
            <Plus className="h-4 w-4" /> {selectedId ? 'Нова категорія' : 'Створити категорію'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Назва
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="Світла риба"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Slug
                <input
                  value={form.slug}
                  onChange={(event) => setForm({ ...form, slug: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="svitla-riba"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              Батьківська категорія
              <select
                value={form.parentId}
                onChange={(event) => setForm({ ...form, parentId: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
              >
                <option value="">Немає батьківської</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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
                <Check className="h-4 w-4" /> {selectedId ? 'Оновити категорію' : 'Створити категорію'}
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
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Швидке керування</p>
              <h3 className="mt-2 text-xl font-semibold text-dark">Підкатегорії та структура</h3>
              <p className="mt-3 text-sm text-slate-600">Редагуйте або додайте категорії, щоб структура каталогу була зрозумілою для покупців.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Всіх категорій</p>
              <p className="mt-4 text-3xl font-semibold text-dark">{categoryOptions.length}</p>
              <p className="mt-2 text-sm text-slate-500">Оберіть батьківську категорію для нової позиції.</p>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-dark">Дерево категорій</h3>
        {loading ? (
          <div className="mt-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {flatCategories.length ? (
              flatCategories.map(({ category, level }) => (
                <div
                  key={category.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
                  style={{ marginLeft: `${level * 1.5}rem` }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{level === 0 ? 'Категорія' : 'Підкатегорія'}</p>
                      <h3 className="mt-2 text-xl font-semibold text-dark">{category.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">Slug: {category.slug}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={category.isActive ? 'rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-700' : 'rounded-2xl bg-amber-50 px-3 py-2 text-amber-700'}>
                        {category.isActive ? 'Активна' : 'Вимкнена'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEdit(category)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:border-primary/40 hover:text-primary"
                      >
                        <Edit3 className="h-4 w-4" /> Редагувати
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category.id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" /> Видалити
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="mt-8 text-slate-500">Категорій ще немає. Додайте першу категорію вище.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
