'use client';

import { useEffect, useState } from 'react';
import { Gift, Star, TrendingUp, ShoppingCart, ArrowUp, ArrowDown } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { motion } from 'framer-motion';
import { CountUp, Reveal } from '@/components/shared/interactive';
import { iconChipClass, tileClass } from '@/lib/ui-classes';

interface Tier { name: string; min: number; discount: number }
interface LoyaltyHistory { id: string; points: number; description: string; createdAt: string }

export default function LoyaltyPage() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<LoyaltyHistory[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [tiers, setTiers] = useState<Tier[]>([
    { name: 'Бронзовий', min: 0, discount: 0 },
    { name: 'Срібний',   min: 500, discount: 5 },
    { name: 'Золотий',   min: 1500, discount: 10 },
    { name: 'Платиновий', min: 3000, discount: 15 },
  ]);
  const [welcomeBonus, setWelcomeBonus] = useState(50);
  const [reviewBonus, setReviewBonus] = useState(25);
  const [pointsRate, setPointsRate] = useState(10);
  const [loading, setLoading] = useState(true);

  const currentPoints = user?.loyaltyPoints ?? 0;
  const currentTier = [...tiers].reverse().find(t => currentPoints >= t.min) ?? tiers[0];
  const nextTier = tiers.find(t => t.min > currentPoints);

  useEffect(() => {
    Promise.all([
      api.get('/loyalty/history'),
      api.get('/loyalty/tiers'),
    ]).then(([histRes, tiersRes]) => {
      setHistory(histRes.data.history ?? []);
      setTotalSpent(histRes.data.totalSpent ?? 0);
      if (tiersRes.data.tiers) setTiers(tiersRes.data.tiers);
      if (tiersRes.data.welcomeBonus) setWelcomeBonus(tiersRes.data.welcomeBonus);
      if (tiersRes.data.reviewBonus) setReviewBonus(tiersRes.data.reviewBonus);
      if (tiersRes.data.pointsRate) setPointsRate(tiersRes.data.pointsRate);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Current points card */}
      <div className="relative overflow-hidden rounded-3xl bg-dark p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-primary-500/30 blur-3xl" />
        <div className="relative flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-white/60">Бонусні бали</p>
            <p className="mt-2 text-5xl font-semibold tabular-nums"><CountUp to={currentPoints} /></p>
            <p className="mt-2 text-sm text-white/70">Рівень: <span className="font-semibold text-white">{currentTier.name}</span></p>
          </div>
          {/* Кільце прогресу до наступного рівня */}
          <div className="relative h-24 w-24 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-white/10" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
                className="stroke-orange-400"
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - (nextTier ? Math.min(currentPoints / nextTier.min, 1) : 1)) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Star className="h-8 w-8 fill-orange-400 text-orange-400" />
            </div>
          </div>
        </div>

        {nextTier && (
          <div className="relative mt-6">
            <div className="mb-2 flex items-center justify-between text-sm text-white/70">
              <span>До рівня «{nextTier.name}»</span>
              <span className="font-semibold text-white">{nextTier.min - currentPoints} балів</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-300 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((currentPoints / nextTier.min) * 100, 100)}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        <div className="relative mt-4 flex items-center gap-2 text-sm text-white/70">
          <ShoppingCart className="h-4 w-4" />
          <span>Загальна сума покупок: <span className="font-semibold text-white">{totalSpent.toLocaleString('uk-UA')} грн</span></span>
        </div>
      </div>

      {/* Tiers */}
      <div className="rounded-3xl border border-dark/10 bg-white p-6">
        <h3 className="mb-5 font-semibold text-dark">Рівні лояльності</h3>
        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Лінія-трек між рівнями (десктоп) */}
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-9 hidden h-0.5 overflow-hidden rounded-full bg-dark-100 sm:block">
            <motion.div
              className="h-full bg-dark"
              initial={{ width: 0 }}
              whileInView={{ width: `${(Math.max(0, tiers.findIndex(t => t.name === currentTier.name)) / Math.max(1, tiers.length - 1)) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          {tiers.map((tier: Tier, i: number) => {
            const isActive = currentPoints >= tier.min && (nextTier ? currentPoints < nextTier.min : true);
            const isReached = currentPoints >= tier.min;
            return (
              <Reveal key={tier.name} index={i}>
              <div
                className={`relative rounded-2xl border p-4 text-center transition-all duration-300 hover:-translate-y-0.5 ${isActive ? 'border-dark/20 bg-white shadow-[0_12px_30px_rgba(13,27,42,0.10)]' : isReached ? 'border-dark/10 bg-white' : 'border-dark/5 bg-dark-50'}`}>
                <div className={`relative mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isReached ? 'bg-dark text-white' : 'bg-white text-dark-200 shadow-sm'}`}>
                  {isActive && <span className="absolute inset-0 animate-ping rounded-full bg-dark/20" />}
                  <Star className={`h-5 w-5 ${isReached ? 'fill-current' : ''}`} />
                </div>
                <p className="text-xs font-semibold text-dark">{tier.name}</p>
                <p className="text-xs text-dark-400">від {tier.min} б.</p>
                <p className={`mt-1 text-sm font-semibold ${isReached ? 'text-dark' : 'text-dark-200'}`}>{tier.discount}%</p>
                {isActive && <span className="mt-1 inline-block rounded-full bg-dark px-2 py-0.5 text-[10px] font-semibold text-white">✓ Поточний</span>}
              </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* How to earn */}
      <div className="rounded-3xl border border-dark/10 bg-white p-6">
        <h3 className="mb-5 font-semibold text-dark">Як заробити бали</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: ShoppingCart, title: 'Покупки', desc: `1 бал за кожні ${pointsRate} грн` },
            { icon: Star, title: 'Відгуки', desc: `${reviewBonus} балів за відгук` },
            { icon: Gift, title: 'Реєстрація', desc: `${welcomeBonus} балів вітального бонусу` },
            { icon: TrendingUp, title: 'Акції', desc: 'Подвійні бали в акційний час' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className={`${tileClass} flex items-center gap-3 p-4`}>
              <div className={iconChipClass}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-dark text-sm">{title}</p>
                <p className="text-xs text-dark-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="rounded-3xl border border-dark/10 bg-white p-6">
        <h3 className="mb-5 font-semibold text-dark">Історія балів</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse rounded-lg bg-dark-50" />)}
          </div>
        ) : history.length === 0 ? (
          <p className="py-8 text-center text-dark-400">Активності ще не було. Зробіть перше замовлення!</p>
        ) : (
          <div className="space-y-3">
            {history.map((entry, i) => (
              <Reveal key={entry.id} index={i % 6}>
              <div className={`${tileClass} flex items-center gap-4 p-4`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${entry.points > 0 ? 'bg-sage-50' : 'bg-red-50'}`}>
                  {entry.points > 0
                    ? <ArrowUp className="h-4 w-4 text-sage-600" />
                    : <ArrowDown className="h-4 w-4 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark truncate">{entry.description}</p>
                  <p className="text-xs text-dark-400">
                    {new Date(entry.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-lg font-semibold tabular-nums ${entry.points > 0 ? 'text-sage-600' : 'text-red-600'}`}>
                  {entry.points > 0 ? '+' : ''}{entry.points}
                </span>
              </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
