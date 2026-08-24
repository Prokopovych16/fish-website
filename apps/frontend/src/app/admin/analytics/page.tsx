'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { TrendingUp, ShoppingBag, Users, Layers, Activity, Package } from 'lucide-react';
import api from '@/lib/api';

type OrderStatusKey = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

const STATUS_LABELS: Record<OrderStatusKey, string> = {
  PENDING: 'Очікує', CONFIRMED: 'Підтверджено', PROCESSING: 'В обробці',
  SHIPPED: 'Відправлено', DELIVERED: 'Доставлено', CANCELLED: 'Скасовано', REFUNDED: 'Повернено',
};

const STATUS_COLORS: Record<OrderStatusKey, string> = {
  PENDING: '#F59E0B', CONFIRMED: '#3B82F6', PROCESSING: '#8B5CF6',
  SHIPPED: '#06B6D4', DELIVERED: '#10B981', CANCELLED: '#EF4444', REFUNDED: '#6B7280',
};

const PAYMENT_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'При отриманні', CARD_ONLINE: 'Карткою онлайн',
  LIQPAY: 'LiqPay', FONDY: 'Fondy',
};

const DELIVERY_LABELS: Record<string, string> = {
  NOVA_POSHTA_BRANCH: 'НП відділення', NOVA_POSHTA_COURIER: "НП кур'єр", PICKUP: 'Самовивіз',
};

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Array<{ status: OrderStatusKey; _count: number }>;
  ordersByPaymentMethod: Array<{ paymentMethod: string; _count: number }>;
  ordersByDeliveryMethod: Array<{ deliveryMethod: string; _count: number }>;
};

type DailyPoint = { date: string; revenue: number; orders: number };

const PERIODS = [
  { label: '7 днів', days: 7 },
  { label: '30 днів', days: 30 },
  { label: '90 днів', days: 90 },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [counts, setCounts] = useState({ products: 0, categories: 0, customers: 0 });
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsRes, productsRes, categoriesRes, usersRes] = await Promise.all([
          api.get('/orders/stats/overview'),
          api.get('/products?limit=1&onlyActive=false&minimal=true'),
          api.get('/categories?includeInactive=true'),
          api.get('/users?limit=1'),
        ]);
        const flatten = (items: any[]): any[] =>
          items.reduce((acc: any[], item: any) => acc.concat(item, flatten(item.children || [])), []);
        setStats(statsRes.data);
        setCounts({
          products: productsRes.data.pagination?.total ?? 0,
          categories: flatten(categoriesRes.data).length,
          customers: usersRes.data.pagination?.total ?? 0,
        });
      } catch (err) {
        console.error('Analytics error', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadDaily = async () => {
      setDailyLoading(true);
      try {
        const res = await api.get(`/orders/stats/daily?days=${period}`);
        setDaily(res.data);
      } catch {
        setDaily([]);
      } finally {
        setDailyLoading(false);
      }
    };
    loadDaily();
  }, [period]);

  const kpis = useMemo(() => [
    {
      label: 'Замовлень', value: stats ? stats.totalOrders.toLocaleString('uk-UA') : '—',
      icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10',
    },
    {
      label: 'Виручка', value: stats ? `${Number(stats.totalRevenue).toLocaleString('uk-UA')} грн` : '—',
      icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100',
    },
    {
      label: 'Товарів', value: counts.products.toLocaleString('uk-UA'),
      icon: Layers, color: 'text-violet-600', bg: 'bg-violet-100',
    },
    {
      label: 'Клієнтів', value: counts.customers.toLocaleString('uk-UA'),
      icon: Users, color: 'text-orange-500', bg: 'bg-orange-100',
    },
  ], [stats, counts]);

  const totalRevenue = daily.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = daily.reduce((s, d) => s + d.orders, 0);
  const avgCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const chartData = daily.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-semibold text-dark">Аналітика</h1>
        <p className="mt-1 text-sm text-slate-500">Показники продажів та активності магазину</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${kpi.bg}`}>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <p className="mt-5 text-sm text-slate-500">{kpi.label}</p>
              <p className="mt-1 text-2xl font-semibold text-dark">
                {loading ? <span className="inline-block h-6 w-24 animate-pulse rounded bg-slate-200" /> : kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-dark">Виручка по днях</h2>
            <p className="mt-1 text-sm text-slate-500">
              За {period} дн: <strong>{totalRevenue.toLocaleString('uk-UA')} грн</strong>
              {' · '}Середній чек: <strong>{avgCheck.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} грн</strong>
            </p>
          </div>
          <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 text-sm">
            {PERIODS.map(p => (
              <button
                key={p.days}
                onClick={() => setPeriod(p.days)}
                className={`rounded-xl px-3 py-1.5 font-medium transition ${
                  period === p.days ? 'bg-white shadow text-dark' : 'text-slate-500 hover:text-dark'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {dailyLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A3D62" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0A3D62" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                interval={period <= 7 ? 0 : Math.floor(period / 8)} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                tickFormatter={(v: number) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v: any) => [`${(v as number)?.toLocaleString('uk-UA')} грн`, 'Виручка']}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0A3D62" strokeWidth={2}
                fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="mb-5 font-semibold text-dark">Замовлення за статусами</h2>
          {stats?.ordersByStatus?.length ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.ordersByStatus.map(i => ({
                  name: STATUS_LABELS[i.status] ?? i.status,
                  count: i._count,
                  status: i.status,
                }))} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(v: any) => [v, 'Замовлень']} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.ordersByStatus.map(i => (
                      <Cell key={i.status} fill={STATUS_COLORS[i.status] ?? '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-wrap gap-2">
                {stats.ordersByStatus.map(i => (
                  <span key={i.status} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: STATUS_COLORS[i.status] ?? '#94a3b8' }}>
                    {STATUS_LABELS[i.status] ?? i.status}: {i._count}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">Немає даних</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-4 font-semibold text-dark">Способи оплати</h2>
            {stats?.ordersByPaymentMethod?.length ? (
              <div className="space-y-2.5">
                {stats.ordersByPaymentMethod.map(i => {
                  const total = stats.ordersByPaymentMethod.reduce((s, x) => s + x._count, 0);
                  const pct = total > 0 ? Math.round(i._count / total * 100) : 0;
                  return (
                    <div key={i.paymentMethod}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{PAYMENT_LABELS[i.paymentMethod] ?? i.paymentMethod}</span>
                        <span className="font-semibold text-dark">{i._count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-slate-400">Немає даних</p>}
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-4 font-semibold text-dark">Способи доставки</h2>
            {stats?.ordersByDeliveryMethod?.length ? (
              <div className="space-y-2.5">
                {stats.ordersByDeliveryMethod.map(i => {
                  const total = stats.ordersByDeliveryMethod.reduce((s, x) => s + x._count, 0);
                  const pct = total > 0 ? Math.round(i._count / total * 100) : 0;
                  return (
                    <div key={i.deliveryMethod}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{DELIVERY_LABELS[i.deliveryMethod] ?? i.deliveryMethod}</span>
                        <span className="font-semibold text-dark">{i._count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-slate-400">Немає даних</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Замовлень за вибраний період', value: totalOrders, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Виручка за вибраний період', value: `${totalRevenue.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} грн`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Середній чек', value: `${avgCheck.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} грн`, icon: Activity, color: 'text-violet-600', bg: 'bg-violet-100' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-1 text-xl font-semibold text-dark">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
