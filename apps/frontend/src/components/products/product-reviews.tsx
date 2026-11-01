'use client';

import { useEffect, useState } from 'react';
import { Star, Send, PenLine, BadgeCheck, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { fieldClass, primaryLinkClass, tileClass } from '@/lib/ui-classes';
import { Reveal, Shine } from '@/components/shared/interactive';

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
    <div className="flex gap-0.5" onMouseLeave={() => interactive && setHover(0)}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = (interactive ? (hover || value) : value) >= i;
        const star = (
          <Star size={size}
            className={`transition-all duration-200 ${filled ? 'fill-[#B8924A] text-[#B8924A]' : 'text-dark-200'}`}
          />
        );
        return interactive ? (
          <motion.button
            key={i}
            type="button"
            aria-label={`Оцінка ${i}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange?.(i)}
            className="flex h-10 w-10 items-center justify-center"
          >
            {star}
          </motion.button>
        ) : (
          <span key={i}>{star}</span>
        );
      })}
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

  // Розподіл оцінок 5 → 1 для смуг
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  return (
    <div className="rounded-3xl border border-dark/10 bg-white p-5 sm:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-dark">Відгуки</h2>
            {reviews.length > 0 && (
              <div className="mt-3 flex items-end gap-3">
                <span className="text-5xl font-semibold leading-none tabular-nums text-dark">{avgRating.toFixed(1)}</span>
                <div className="pb-1">
                  <Stars value={Math.round(avgRating)} size={16} />
                  <p className="mt-1 text-xs text-dark-400">{total} відгук{total === 1 ? '' : total > 1 && total < 5 ? 'и' : 'ів'}</p>
                </div>
              </div>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="w-full space-y-1.5 sm:w-56">
              {distribution.map(({ star, count }, i) => (
                <div key={star} className="flex items-center gap-2 text-xs text-dark-500">
                  <span className="w-3 tabular-nums">{star}</span>
                  <Star size={11} className="fill-[#B8924A] text-[#B8924A]" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-dark-100">
                    <motion.div
                      className="h-full rounded-full bg-[#B8924A]"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(count / reviews.length) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="w-5 text-right tabular-nums text-dark-400">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!showForm && !submitSuccess && (
          <button onClick={() => setShowForm(true)} className={`${primaryLinkClass} self-start lg:self-auto`}>
            <Shine />
            <span className="relative flex items-center gap-2">
              <PenLine className="h-4 w-4" /> Написати відгук
            </span>
          </button>
        )}
      </div>

      {/* Success message */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mb-6 flex items-center gap-3 rounded-2xl bg-sage-50 px-4 py-3 text-sm font-medium text-sage-600"
          >
            <BadgeCheck className="h-5 w-5" />
            Дякуємо! Ваш відгук надіслано на модерацію.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <AnimatePresence initial={false}>
      {showForm && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="overflow-hidden"
        >
        <div className="mb-6 space-y-4 rounded-2xl border border-dark/5 bg-dark-50 p-5">
          <h3 className="font-semibold text-dark">Ваш відгук</h3>
          <div>
            <p className="mb-1 text-sm font-medium text-dark-500">Оцінка</p>
            <div className="-ml-2.5">
              <Stars value={form.rating} size={24} interactive onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-600">Ваше ім'я *</label>
              <input value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))}
                placeholder="Іван П."
                className={`${fieldClass} bg-white px-4 py-3`} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-600">Місто</label>
              <input value={form.authorCity} onChange={e => setForm(f => ({ ...f, authorCity: e.target.value }))}
                placeholder="Київ"
                className={`${fieldClass} bg-white px-4 py-3`} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-600">Заголовок</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Коротко про враження..."
              className={`${fieldClass} bg-white px-4 py-3`} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-600">Відгук *</label>
            <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
              rows={4} placeholder="Поділіться враженнями про товар..."
              className={`${fieldClass} resize-none bg-white px-4 py-3`} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleSubmit} disabled={submitting || !form.text.trim() || !form.authorName.trim()}
              className={`${primaryLinkClass} disabled:cursor-not-allowed disabled:opacity-50`}>
              <Shine />
              <span className="relative flex items-center gap-2">
                <Send className="h-4 w-4" />
                {submitting ? 'Надсилання...' : 'Надіслати'}
              </span>
            </button>
            <button onClick={() => setShowForm(false)}
              className="min-h-[44px] rounded-xl px-5 text-sm font-medium text-dark-500 transition-all hover:bg-white hover:text-dark">
              Скасувати
            </button>
          </div>
        </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-28 animate-pulse rounded-2xl bg-dark-50" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl bg-dark-50 py-12 text-center text-dark-400">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <MessageSquare className="h-6 w-6 text-dark-300" />
          </div>
          <p>Відгуків ще немає. Будьте першим!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review, i) => (
            <Reveal key={review.id} index={i % 4} className="h-full">
            <div className={`${tileClass} h-full p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-sm font-semibold text-dark-500 shadow-sm transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    {review.authorAvatar
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={review.authorAvatar} alt={review.authorName} className="h-10 w-10 object-cover" />
                      : review.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span className="text-sm font-medium text-dark">{review.authorName}</span>
                      {review.authorCity && <span className="text-xs text-dark-400">{review.authorCity}</span>}
                    </div>
                    <Stars value={review.rating} size={12} />
                  </div>
                </div>
                <span className="shrink-0 text-xs text-dark-400">
                  {new Date(review.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {review.isVerified && (
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-sage-50 px-2.5 py-1 text-[11px] font-medium text-sage-600">
                  <BadgeCheck className="h-3.5 w-3.5" /> Перевірена покупка
                </span>
              )}
              {review.title && <p className="mt-3 text-sm font-medium text-dark">{review.title}</p>}
              <p className="mt-2 text-sm leading-relaxed text-dark-500">{review.text}</p>
            </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
