'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Star, Settings, Plus, Minus, Save, X } from 'lucide-react';
import api from '@/lib/api';

interface Tier { name: string; min: number; discount: number }
interface LoyaltyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  loyaltyPoints: number;
  totalSpent: number;
  tier: Tier;
}
interface LoyaltySettings {
  pointsRate: number;
  welcomeBonus: number;
  reviewBonus: number;
  tiers: Tier[];
}

interface AdjustModal {
  user: LoyaltyUser;
  mode: 'add' | 'remove';
}

export default function AdminLoyaltyPage() {
  const [tab, setTab] = useState<'users' | 'settings'>('users');

  // Users tab
  const [users, setUsers] = useState<LoyaltyUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [adjustModal, setAdjustModal] = useState<AdjustModal | null>(null);
  const [adjustPoints, setAdjustPoints] = useState('');
  const [adjustDesc, setAdjustDesc] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  // Settings tab
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [form, setForm] = useState<any>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/loyalty/admin/users', {
        params: { page, limit: 20, search: search || undefined },
      });
      setUsers(res.data.data ?? []);
      setTotal(res.data.pagination?.total ?? 0);
    } catch {}
    setLoadingUsers(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    api.get('/loyalty/admin/settings').then(r => {
      setSettings(r.data);
      setForm({
        pointsRate:       r.data.pointsRate,
        welcomeBonus:     r.data.welcomeBonus,
        reviewBonus:      r.data.reviewBonus,
        silverMin:        r.data.tiers[1]?.min,
        goldMin:          r.data.tiers[2]?.min,
        platinumMin:      r.data.tiers[3]?.min,
        silverDiscount:   r.data.tiers[1]?.discount,
        goldDiscount:     r.data.tiers[2]?.discount,
        platinumDiscount: r.data.tiers[3]?.discount,
      });
    }).catch(() => {});
  }, []);

  const handleAdjust = async () => {
    if (!adjustModal || !adjustPoints) return;
    const pts = parseInt(adjustPoints);
    if (isNaN(pts) || pts <= 0) return;
    setAdjusting(true);
    try {
      const delta = adjustModal.mode === 'add' ? pts : -pts;
      await api.post('/loyalty/admin/adjust', {
        userId: adjustModal.user.id,
        points: delta,
        description: adjustDesc || (adjustModal.mode === 'add' ? 'Нарахування адміністратором' : 'Списання адміністратором'),
      });
      setAdjustModal(null);
      setAdjustPoints('');
      setAdjustDesc('');
      fetchUsers();
    } catch {}
    setAdjusting(false);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const updated = await api.patch('/loyalty/admin/settings', {
        pointsRate:       Number(form.pointsRate),
        welcomeBonus:     Number(form.welcomeBonus),
        reviewBonus:      Number(form.reviewBonus),
        silverMin:        Number(form.silverMin),
        goldMin:          Number(form.goldMin),
        platinumMin:      Number(form.platinumMin),
        silverDiscount:   Number(form.silverDiscount),
        goldDiscount:     Number(form.goldDiscount),
        platinumDiscount: Number(form.platinumDiscount),
      });
      setSettings(updated.data);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch {}
    setSavingSettings(false);
  };

  const pages = Math.ceil(total / 20);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Бонусна програма</h1>
          <p className="mt-1 text-sm text-dark-500">Управління балами клієнтів та налаштуваннями</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-dark-50 p-1 w-fit">
        {(['users', 'settings'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-dark shadow-sm' : 'text-dark-500 hover:text-dark'
            }`}
          >
            {t === 'users' ? <Star className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            {t === 'users' ? 'Клієнти' : 'Налаштування'}
          </button>
        ))}
      </div>

      {/* ── Users tab ─────────────────────────────────── */}
      {tab === 'users' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Пошук по email або імені..."
              className="w-full rounded-lg border border-dark/10 pl-9 pr-4 py-2.5 text-sm focus:border-dark/30 focus:outline-none"
            />
          </div>

          {/* Table */}
          <div className="rounded-xl border border-dark/10 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-dark-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Клієнт</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Рівень</th>
                  <th className="px-4 py-3 text-right font-medium text-dark-500">Бали</th>
                  <th className="px-4 py-3 text-right font-medium text-dark-500">Сума покупок</th>
                  <th className="px-4 py-3 text-right font-medium text-dark-500">Дії</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-t border-dark/5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 animate-pulse rounded bg-dark-50" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-dark-400">
                      Клієнтів не знайдено
                    </td>
                  </tr>
                ) : users.map(u => (
                  <tr key={u.id} className="border-t border-dark/5 hover:bg-dark-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-dark">{u.firstName} {u.lastName ?? ''}</div>
                      <div className="text-xs text-dark-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-dark-50 px-2.5 py-0.5 text-xs font-medium text-dark-600">
                        {u.tier.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-dark">{u.loyaltyPoints}</td>
                    <td className="px-4 py-3 text-right text-dark-500">{u.totalSpent.toLocaleString('uk-UA')} ₴</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setAdjustModal({ user: u, mode: 'add' }); setAdjustPoints(''); setAdjustDesc(''); }}
                          className="flex items-center gap-1 rounded-md bg-sage-50 px-2.5 py-1.5 text-xs font-medium text-sage-600 transition hover:bg-sage-100"
                        >
                          <Plus className="h-3 w-3" /> Нарахувати
                        </button>
                        <button
                          onClick={() => { setAdjustModal({ user: u, mode: 'remove' }); setAdjustPoints(''); setAdjustDesc(''); }}
                          className="flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        >
                          <Minus className="h-3 w-3" /> Списати
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between border-t border-dark/5 px-4 py-3">
                <span className="text-xs text-dark-400">Всього {total} клієнтів</span>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(pages, 7) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`rounded px-3 py-1 text-sm transition ${page === i + 1 ? 'bg-dark text-white' : 'text-dark-500 hover:bg-dark-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Settings tab ──────────────────────────────── */}
      {tab === 'settings' && settings && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-dark/10 bg-white p-6 space-y-5">
            <h2 className="font-semibold text-dark">Нарахування балів</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Грн за 1 бал" hint="Наприклад: 10 = 1 бал з кожних 10 грн">
                <input type="number" min={1} value={form.pointsRate ?? ''} onChange={e => setForm({ ...form, pointsRate: e.target.value })}
                  className="input" />
              </Field>
              <Field label="Вітальний бонус (балів)" hint="Після підтвердження email">
                <input type="number" min={0} value={form.welcomeBonus ?? ''} onChange={e => setForm({ ...form, welcomeBonus: e.target.value })}
                  className="input" />
              </Field>
              <Field label="Бонус за відгук (балів)">
                <input type="number" min={0} value={form.reviewBonus ?? ''} onChange={e => setForm({ ...form, reviewBonus: e.target.value })}
                  className="input" />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-dark/10 bg-white p-6 space-y-5">
            <h2 className="font-semibold text-dark">Рівні лояльності</h2>
            <div className="space-y-4">
              {[
                { label: 'Срібний', minKey: 'silverMin', discKey: 'silverDiscount' },
                { label: 'Золотий', minKey: 'goldMin', discKey: 'goldDiscount' },
                { label: 'Платиновий', minKey: 'platinumMin', discKey: 'platinumDiscount' },
              ].map(tier => (
                <div key={tier.label} className="flex items-end gap-4 rounded-lg bg-dark-50 p-4">
                  <span className="w-24 shrink-0 text-sm font-medium text-dark">{tier.label}</span>
                  <Field label="Мінімум балів" className="flex-1">
                    <input type="number" min={1} value={form[tier.minKey] ?? ''}
                      onChange={e => setForm({ ...form, [tier.minKey]: e.target.value })}
                      className="input" />
                  </Field>
                  <Field label="Знижка (%)" className="w-28">
                    <input type="number" min={0} max={100} value={form[tier.discKey] ?? ''}
                      onChange={e => setForm({ ...form, [tier.discKey]: e.target.value })}
                      className="input" />
                  </Field>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center gap-2 rounded-lg bg-dark px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-dark-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {savingSettings ? 'Збереження...' : 'Зберегти налаштування'}
            </button>
            {settingsSaved && <span className="text-sm text-sage-600">✓ Збережено</span>}
          </div>
        </div>
      )}

      {/* ── Adjust modal ──────────────────────────────── */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-dark">
                  {adjustModal.mode === 'add' ? 'Нарахувати бали' : 'Списати бали'}
                </h3>
                <p className="text-sm text-dark-500 mt-0.5">
                  {adjustModal.user.firstName} {adjustModal.user.lastName ?? ''} · зараз {adjustModal.user.loyaltyPoints} балів
                </p>
              </div>
              <button onClick={() => setAdjustModal(null)} className="text-dark-400 hover:text-dark">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1.5">Кількість балів</label>
                <input
                  type="number" min={1} value={adjustPoints} onChange={e => setAdjustPoints(e.target.value)}
                  placeholder="Введіть кількість"
                  className="w-full rounded-lg border border-dark/10 px-3 py-2.5 text-sm focus:border-dark/30 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1.5">Причина (необов'язково)</label>
                <input
                  type="text" value={adjustDesc} onChange={e => setAdjustDesc(e.target.value)}
                  placeholder={adjustModal.mode === 'add' ? 'Нарахування адміністратором' : 'Списання адміністратором'}
                  className="w-full rounded-lg border border-dark/10 px-3 py-2.5 text-sm focus:border-dark/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={() => setAdjustModal(null)}
                className="flex-1 rounded-lg border border-dark/10 py-2.5 text-sm font-medium text-dark-500 transition hover:border-dark/30">
                Скасувати
              </button>
              <button
                onClick={handleAdjust} disabled={adjusting || !adjustPoints}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${
                  adjustModal.mode === 'add' ? 'bg-sage-600 hover:bg-sage-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {adjusting ? 'Збереження...' : adjustModal.mode === 'add' ? 'Нарахувати' : 'Списати'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(22 24 28 / 0.1);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: rgb(22 24 28 / 0.3); }
      `}</style>
    </div>
  );
}

function Field({ label, hint, className = '', children }: {
  label: string; hint?: string; className?: string; children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-dark-600 mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-dark-400">{hint}</p>}
    </div>
  );
}
