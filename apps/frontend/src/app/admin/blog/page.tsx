'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import api from '@/lib/api';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  image?: string | null;
  authorName: string;
  status: 'DRAFT' | 'PUBLISHED';
  tags: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  publishedAt?: string | null;
};

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  authorName: string;
  status: BlogPost['status'];
  tags: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
};

const initialForm: BlogForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image: '',
  authorName: '',
  status: 'DRAFT',
  tags: '',
  seoTitle: '',
  seoDescription: '',
  publishedAt: '',
};

const LIMIT = 15;

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BlogPost['status'] | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPosts = useCallback(async (p: number, status: string, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (status) params.set('status', status);
      if (q) params.set('search', q);
      const response = await api.get(`/blog?${params}`);
      setPosts(response.data.data || []);
      setTotal(response.data.pagination?.total ?? 0);
    } catch {
      setError('Не вдалося завантажити пости.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(page, statusFilter, search);
  }, [page, statusFilter, search, loadPosts]);

  const pages = Math.ceil(total / LIMIT);

  const handleStatusFilterChange = (val: BlogPost['status'] | '') => {
    setStatusFilter(val);
    setPage(1);
  };

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

    if (!form.title || !form.slug || !form.content) {
      setError('Вкажіть заголовок, slug та контент.');
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || undefined,
      content: form.content,
      image: form.image || undefined,
      authorName: form.authorName || undefined,
      status: form.status,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      publishedAt: form.publishedAt || undefined,
    };

    try {
      if (selectedId) {
        await api.patch(`/blog/${selectedId}`, payload);
        setMessage('Публікацію оновлено');
      } else {
        await api.post('/blog', payload);
        setMessage('Публікацію створено');
      }
      await loadPosts(page, statusFilter, search);
      resetForm();
    } catch (submitError: any) {
      setError(submitError.response?.data?.message || 'Не вдалося зберегти публікацію.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      image: post.image || '',
      authorName: post.authorName || '',
      status: post.status,
      tags: post.tags.join(', '),
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      publishedAt: post.publishedAt ? post.publishedAt.slice(0, 10) : '',
    });
    setMessage('');
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити публікацію?')) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.delete(`/blog/${id}`);
      setMessage('Публікацію видалено');
      await loadPosts(page, statusFilter, search);
      if (selectedId === id) resetForm();
    } catch (deleteError: any) {
      setError(deleteError.response?.data?.message || 'Не вдалося видалити публікацію.');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: 'DRAFT', label: 'Чернетка' },
    { value: 'PUBLISHED', label: 'Опубліковано' },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Блог</p>
            <h2 className="mt-3 text-3xl font-semibold text-dark">Керування блогом</h2>
            <p className="mt-2 text-slate-600">Створюйте рецепти, новини та статті з SEO-налаштуваннями.</p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white transition hover:bg-primary-light"
          >
            <Plus className="h-4 w-4" /> {selectedId ? 'Нова публікація' : 'Додати пост'}
          </button>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Заголовок
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="Ідеальна сьомга для грилю"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Slug
                <input
                  value={form.slug}
                  onChange={(event) => setForm({ ...form, slug: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="idealna-somaga-dlya-grilyu"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              Короткий опис
              <textarea
                value={form.excerpt}
                onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
                className="w-full min-h-[96px] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                placeholder="Короткий опис для сторінки блогу"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              Контент
              <textarea
                value={form.content}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
                className="w-full min-h-[160px] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                placeholder="HTML або Markdown контент"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Зображення
                <input
                  value={form.image}
                  onChange={(event) => setForm({ ...form, image: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="https://..."
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Автор
                <input
                  value={form.authorName}
                  onChange={(event) => setForm({ ...form, authorName: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="Команда Валігура"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-700">
                Статус
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as BlogPost['status'] })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Теги
                <input
                  value={form.tags}
                  onChange={(event) => setForm({ ...form, tags: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                  placeholder="рецепти, риба, здорове харчування"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Опубліковано
                <input
                  value={form.publishedAt}
                  onChange={(event) => setForm({ ...form, publishedAt: event.target.value })}
                  type="date"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              SEO title
              <input
                value={form.seoTitle}
                onChange={(event) => setForm({ ...form, seoTitle: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                placeholder="SEO title"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              SEO description
              <textarea
                value={form.seoDescription}
                onChange={(event) => setForm({ ...form, seoDescription: event.target.value })}
                className="w-full min-h-[96px] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none"
                placeholder="SEO description"
              />
            </label>

            {error && <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            {message && <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check className="h-4 w-4" /> {selectedId ? 'Оновити пост' : 'Створити пост'}
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
            {/* Filters */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Пошук..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <button onClick={handleSearch} className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90">
                  Знайти
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value as BlogPost['status'] | '')}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">Всі статуси</option>
                  <option value="DRAFT">Чернетки</option>
                  <option value="PUBLISHED">Опубліковані</option>
                </select>
                <span className="text-xs text-slate-500">{total} постів</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                </div>
              ) : posts.length ? (
                <div className="divide-y divide-slate-100">
                  {posts.map((post) => (
                    <div key={post.id} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-400 truncate">/{post.slug}</p>
                          <p className="mt-0.5 font-semibold text-dark text-sm line-clamp-2">{post.title}</p>
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                            <span className={`rounded-full px-2 py-0.5 font-medium ${
                              post.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {post.status === 'PUBLISHED' ? 'Опубліковано' : 'Чернетка'}
                            </span>
                            {post.tags.length > 0 && (
                              <span className="text-slate-400">{post.tags.slice(0, 2).join(', ')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(post)}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 transition hover:border-primary hover:text-primary"
                            title="Редагувати"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
                            className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100"
                            title="Видалити"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">Постів не знайдено</div>
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
      </div>
    </div>
  );
}
