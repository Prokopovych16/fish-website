'use client';

import { useEffect, useState } from 'react';
import { Star, Send, User } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

interface Review {
  id: string;
  authorName: string;
  authorCity?: string;
  authorAvatar?: string;
  rating: number;
  title?: string;
  text: string;
  isVerified: boolean;
  createdAt: string;
}

function Stars({ value, size = 16, interactive = false, onChange }: { value: number; size?: number; interactive?: boolean; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size}
          className={`transition-colors ${(interactive ? (hover || value) : value) >= i ? 'fill-[#B8924A] text-[#B8924A]' : 'text-dark-200'} ${interactive ? 'cursor-pointer' : ''}`}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange?.(i)}
        />
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const { user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: '', text: '', authorName: user?.firstName || '', authorCity: '' });

  useEffect(() => {
    api.get(`/reviews/product/${productId}?limit=10`).then(r => {
      const data = r.data;
      const list = Array.isArray(data) ? data : (data.data ?? data.reviews ?? []);
      const count = data.pagination?.total ?? data.total ?? list.length;
      setReviews(list);
      setTotal(count);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [productId]);

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const handleSubmit = async () => {
    if (!form.text.trim() || !form.authorName.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/reviews', { productId, ...form });
      setSubmitSuccess(true);
      setShowForm(false);
      setForm(f => ({ ...f, title: '', text: '' }));
    } catch {
      // silently ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-dark/10 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-dark">Відгуки</h2>
          {reviews.length > 0 && (
            <div className="mt-2 flex items-center gap-3">
              <Stars value={Math.round(avgRating)} size={16} />
              <span className="text-base font-semibold text-dark">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-dark-400">{total} відгук{total === 1 ? '' : total < 5 ? 'и' : 'ів'}</span>
            </div>
          )}
        </div>
        {!showForm && !submitSuccess && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-dark px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dark-700">
            Написати відгук
          </button>
        )}
      </div>

      {/* Success message */}
      {submitSuccess && (
        <div className="mb-6 rounded-lg bg-sage-50 px-4 py-3 text-sm text-sage-600">
          Дякуємо! Ваш відгук надіслано на модерацію.
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-lg border border-dark/10 bg-dark-50 p-5 space-y-4">
          <h3 className="font-semibold text-dark">Ваш відгук</h3>
          <div>
            <p className="mb-2 text-sm font-medium text-dark-500">Оцінка</p>
            <Stars value={form.rating} size={22} interactive onChange={v => setForm(f => ({ ...f, rating: v }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-dark-600">Ваше ім'я *</label>
              <input value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))}
                placeholder="Іван П."
                className="w-full rounded-lg border border-dark/10 bg-white px-3 py-2.5 text-sm focus:border-dark/30 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-dark-600">Місто</label>
              <input value={form.authorCity} onChange={e => setForm(f => ({ ...f, authorCity: e.target.value }))}
                placeholder="Київ"
                className="w-full rounded-lg border border-dark/10 bg-white px-3 py-2.5 text-sm focus:border-dark/30 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-dark-600">Заголовок</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Коротко про враження..."
              className="w-full rounded-lg border border-dark/10 bg-white px-3 py-2.5 text-sm focus:border-dark/30 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-dark-600">Відгук *</label>
            <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
              rows={4} placeholder="Поділіться враженнями про товар..."
              className="w-full rounded-lg border border-dark/10 bg-white px-3 py-2.5 text-sm focus:border-dark/30 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={submitting || !form.text.trim() || !form.authorName.trim()}
              className="flex items-center gap-2 rounded-lg bg-dark px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dark-700 disabled:opacity-60">
              <Send className="h-4 w-4" />
              {submitting ? 'Надсилання...' : 'Надіслати'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="rounded-lg border border-dark/10 px-4 py-2.5 text-sm font-medium text-dark-500 transition-colors hover:bg-dark/5">
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-28 animate-pulse rounded-lg bg-dark-50" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center text-dark-400">
          <Star className="mx-auto mb-3 h-9 w-9 text-dark-200" />
          <p>Відгуків ще немає. Будьте першим!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="rounded-lg border border-dark/10 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dark-50 text-dark-400 shrink-0">
                    {review.authorAvatar
                      ? <img src={review.authorAvatar} alt={review.authorName} className="h-9 w-9 rounded-full object-cover" />
                      : <User className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-dark text-sm">{review.authorName}</span>
                      {review.authorCity && <span className="text-xs text-dark-400">{review.authorCity}</span>}
                      {review.isVerified && (
                        <span className="rounded-md bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-600">Перевірена покупка</span>
                      )}
                    </div>
                    <Stars value={review.rating} size={12} />
                  </div>
                </div>
                <span className="text-xs text-dark-400 shrink-0">
                  {new Date(review.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              {review.title && <p className="mt-3 font-medium text-dark text-sm">{review.title}</p>}
              <p className="mt-2 text-sm leading-relaxed text-dark-500">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
