'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Star, Quote, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface Review {
  id: string;
  authorName: string;
  authorCity?: string;
  authorAvatar?: string;
  rating: number;
  title?: string;
  text: string;
  images: string[];
  isVerified: boolean;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reviews/published?limit=50')
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
        setReviews(data);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-dark-50">
          <MessageCircle className="h-7 w-7 text-dark-500" />
        </div>
        <h1 className="text-3xl font-semibold text-dark sm:text-4xl">Відгуки покупців</h1>
        <p className="mt-3 text-base text-dark-500">
          Що кажуть наші клієнти про продукцію та сервіс
        </p>
        {reviews.length > 0 && !loading && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i <= Math.round(avgRating) ? 'fill-[#B8924A] text-[#B8924A]' : 'text-dark-200'}`}
                />
              ))}
            </div>
            <span className="text-xl font-semibold text-dark">{avgRating.toFixed(1)}</span>
            <span className="text-dark-500">з {reviews.length} відгуків</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse rounded-3xl border border-dark/10 bg-white p-8">
              <div className="mb-4 flex gap-1">
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="h-4 w-4 rounded-full bg-dark-100" />
                ))}
              </div>
              <div className="h-4 w-full rounded-full bg-dark-100 mb-2" />
              <div className="h-4 w-3/4 rounded-full bg-dark-100 mb-6" />
              <div className="h-3 w-24 rounded-full bg-dark-100" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-3xl border border-dark/10 bg-white p-16 text-center">
          <MessageCircle className="mx-auto mb-4 h-16 w-16 text-dark-200" />
          <p className="text-xl font-medium text-dark">Відгуків ще немає</p>
          <p className="mt-2 text-dark-500">Станьте першим, хто залишить відгук!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}
              className="h-full pt-4"
            >
              <div className="group relative h-full rounded-3xl border border-dark/10 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-dark/15 hover:shadow-[0_18px_40px_rgba(13,27,42,0.10)]">
              <div className="absolute -top-4 left-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dark text-white shadow-[0_8px_20px_rgba(22,24,28,0.2)] transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
                  <Quote className="h-5 w-5" />
                </div>
              </div>

              <div className="mb-4 flex items-center gap-1 pt-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i <= review.rating ? 'fill-[#B8924A] text-[#B8924A]' : 'text-dark-200'}`}
                  />
                ))}
              </div>

              {review.title && (
                <h3 className="mb-3 font-semibold text-dark">{review.title}</h3>
              )}

              <p className="mb-6 text-dark-600 leading-relaxed line-clamp-4">"{review.text}"</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {review.authorAvatar ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image src={review.authorAvatar} alt={review.authorName} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dark-50 text-dark-500 font-semibold text-sm">
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-dark text-sm">{review.authorName}</p>
                    {review.authorCity && (
                      <p className="text-xs text-dark-500">{review.authorCity}</p>
                    )}
                  </div>
                </div>
                {review.isVerified && (
                  <div className="flex items-center gap-1 rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-sage-600" />
                    Перевірена
                  </div>
                )}
              </div>

              {review.images.length > 0 && (
                <div className="mt-4 flex gap-2">
                  {review.images.slice(0, 3).map((img, idx) => (
                    <div key={idx} className="relative h-14 w-14 overflow-hidden rounded-lg">
                      <Image src={img} alt={`Фото ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                  {review.images.length > 3 && (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-dark-50 text-sm font-medium text-dark-500">
                      +{review.images.length - 3}
                    </div>
                  )}
                </div>
              )}

              <p className="mt-3 text-xs text-dark-400">
                {new Date(review.createdAt).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
