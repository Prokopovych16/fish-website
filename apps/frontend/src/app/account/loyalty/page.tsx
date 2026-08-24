'use client';

import { useEffect, useState } from 'react';
import { Gift, Star, TrendingUp, ShoppingCart, ArrowUp, ArrowDown } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

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
      <div className="rounded-xl bg-dark p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/60 uppercase tracking-widest">Бонусні бали</p>
            <p className="mt-2 text-5xl font-semibold">{currentPoints}</p>
            <p className="mt-2 text-sm text-white/70">Рівень: <span className="font-semibold text-white">{currentTier.name}</span></p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
            <Star className="h-10 w-10 text-white" />
          </div>
        </div>

        {nextTier && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm text-white/70">
              <span>До рівня «{nextTier.name}»</span>
              <span className="font-semibold text-white">{nextTier.min - currentPoints} балів</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{ width: `${Math.min((currentPoints / nextTier.min) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
          <ShoppingCart className="h-4 w-4" />
          <span>Загальна сума покупок: <span className="font-semibold text-white">{totalSpent.toLocaleString('uk-UA')} грн</span></span>
        </div>
      </div>

      {/* Tiers */}
      <div className="rounded-xl bg-white p-6 border border-dark/10">
        <h3 className="mb-5 font-semibold text-dark">Рівні лояльності</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiers.map((tier: Tier) => {
            const isActive = currentPoints >= tier.min && (nextTier ? currentPoints < nextTier.min : true);
            const isReached = currentPoints >= tier.min;
            return (
              <div key={tier.name}
                className={`rounded-lg border p-4 text-center transition-colors ${isActive ? 'border-dark bg-dark-50' : isReached ? 'border-dark/15 bg-white' : 'border-dark/10 bg-dark-50'}`}>
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-dark-50">
                  <Star className={`h-5 w-5 ${isReached ? 'text-dark-600' : 'text-dark-200'}`} />
                </div>
                <p className="text-xs font-semibold text-dark">{tier.name}</p>
                <p className="text-xs text-dark-400">від {tier.min} б.</p>
                <p className={`mt-1 text-sm font-semibold ${isReached ? 'text-dark' : 'text-dark-200'}`}>{tier.discount}%</p>
                {isActive && <span className="mt-1 inline-block rounded-full bg-dark px-2 py-0.5 text-[10px] font-semibold text-white">✓ Поточний</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* How to earn */}
      <div className="rounded-xl bg-white p-6 border border-dark/10">
        <h3 className="mb-5 font-semibold text-dark">Як заробити бали</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: ShoppingCart, title: 'Покупки', desc: `1 бал за кожні ${pointsRate} грн` },
            { icon: Star, title: 'Відгуки', desc: `${reviewBonus} балів за відгук` },
            { icon: Gift, title: 'Реєстрація', desc: `${welcomeBonus} балів вітального бонусу` },
            { icon: TrendingUp, title: 'Акції', desc: 'Подвійні бали в акційний час' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 rounded-lg bg-dark-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-dark-500">
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
      <div className="rounded-xl bg-white p-6 border border-dark/10">
        <h3 className="mb-5 font-semibold text-dark">Історія балів</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse rounded-lg bg-dark-50" />)}
          </div>
        ) : history.length === 0 ? (
          <p className="py-8 text-center text-dark-400">Активності ще не було. Зробіть перше замовлення!</p>
        ) : (
          <div className="space-y-3">
            {history.map(entry => (
              <div key={entry.id} className="flex items-center gap-4 rounded-lg bg-dark-50 p-4">
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
                <span className={`text-lg font-semibold ${entry.points > 0 ? 'text-sage-600' : 'text-red-600'}`}>
                  {entry.points > 0 ? '+' : ''}{entry.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
