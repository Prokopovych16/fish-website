'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, Clock, CheckCircle, Package, Truck, XCircle, CreditCard,
  ChevronLeft, ChevronRight, Filter, RefreshCw,
} from 'lucide-react';
import api from '@/lib/api';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  PENDING:    { label: 'Нові',          color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200', icon: Clock },
  CONFIRMED:  { label: 'Підтверджені', color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',  icon: CheckCircle },
  PROCESSING: { label: 'В обробці',    color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200',icon: Package },
  SHIPPED:    { label: 'Відправлені',  color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-200',icon: Truck },
  DELIVERED:  { label: 'Доставлені',  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200',icon: CheckCircle },
  CANCELLED:  { label: 'Скасовані',   color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',   icon: XCircle },
  REFUNDED:   { label: 'Повернення',  color: 'text-slate-700',   bg: 'bg-slate-100',  border: 'border-slate-200', icon: XCircle },
};

const PAYMENT_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'Накладений платіж',
  CARD_ONLINE: 'Картка онлайн',
  LIQPAY: 'LiqPay',
  FONDY: 'Fondy',
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Не сплачено', color: 'text-orange-600' },
  PAID:    { label: 'Сплачено',    color: 'text-emerald-600' },
  FAILED:  { label: 'Помилка',     color: 'text-red-600' },
  REFUNDED:{ label: 'Повернуто',   color: 'text-slate-600' },
};

const ALL_STATUSES = ['ALL', ...Object.keys(STATUS_CONFIG)] as const;
type TabStatus = typeof ALL_STATUSES[number];

const LIMIT = 15;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabStatus>('ALL');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const fetchOrders = useCallback(async (tab: TabStatus, p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (tab !== 'ALL') params.set('status', tab);
      if (q) params.set('search', q);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.data ?? []);
      setTotal(res.data.pagination?.total ?? 0);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const results = await Promise.all(
        (Object.keys(STATUS_CONFIG) as OrderStatus[]).map(status =>
          api.get(`/orders?status=${status}&limit=1`).then(r => ({ status, count: r.data.pagination?.total ?? 0 }))
        )
      );
      const map: Record<string, number> = {};
      for (const r of results) map[r.status] = r.count;
      setCounts(map);
    } catch {}
  }, []);

  useEffect(() => {
    fetchOrders(activeTab, page, search);
  }, [activeTab, page, search, fetchOrders]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleTabChange = (tab: TabStatus) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Адмін-панель</p>
            <h2 className="mt-2 text-3xl font-semibold text-dark">Замовлення</h2>
            <p className="mt-1 text-slate-500">
              Всього: <span className="font-semibold text-dark">{total}</span>
              {counts.PENDING > 0 && (
                <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  🔔 {counts.PENDING} нових
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                placeholder="Ім'я, телефон, email, номер..."
              />
            </div>
            <button
              onClick={handleSearch}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Шукати
            </button>
            <button
              onClick={() => { setSearch(''); setSearchInput(''); fetchCounts(); }}
              className="flex items-center justify-center rounded-2xl border border-slate-200 p-3 text-slate-500 transition hover:border-primary hover:text-primary"
              title="Оновити"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleTabChange('ALL')}
          className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
            activeTab === 'ALL'
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
              : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'
          }`}
        >
          Всі ({Object.values(counts).reduce((a, b) => a + b, 0)})
        </button>
        {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map(status => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          const count = counts[status] ?? 0;
          const isActive = activeTab === status;
          return (
            <button
              key={status}
              onClick={() => handleTabChange(status)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cfg.label}
              {count > 0 && (
                <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${isActive ? '' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders table */}
      <div className="rounded-3xl bg-white shadow-sm overflow-hidden border border-slate-100">
        {loading ? (
          <div className="space-y-px">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse p-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="h-4 w-28 rounded-full bg-slate-200" />
                  <div className="h-4 w-40 rounded-full bg-slate-100" />
                  <div className="ml-auto h-7 w-24 rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-slate-200" />
            <p className="text-slate-500">Замовлень не знайдено</p>
            {search && (
              <button onClick={() => { setSearch(''); setSearchInput(''); }} className="mt-3 text-sm text-primary hover:underline">
                Скинути пошук
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_80px] gap-4 border-b border-slate-100 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Замовлення / Клієнт</span>
              <span>Сума</span>
              <span>Оплата</span>
              <span>Доставка</span>
              <span>Статус</span>
              <span />
            </div>

            <div className="divide-y divide-slate-100">
              {orders.map(order => {
                const status = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.PENDING;
                const StatusIcon = status.icon;
                const payStatus = PAYMENT_STATUS_CONFIG[order.paymentStatus] ?? { label: order.paymentStatus, color: 'text-slate-600' };

                return (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="group flex flex-col gap-3 px-6 py-4 transition hover:bg-slate-50/70 lg:grid lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_80px] lg:items-center lg:gap-4"
                  >
                    {/* Order / Customer */}
                    <div>
                      <p className="font-semibold text-dark text-sm group-hover:text-primary transition-colors">
                        #{order.orderNumber}
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {order.contactFirstName} {order.contactLastName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="font-bold text-dark">{Number(order.total).toLocaleString('uk-UA')} грн</p>
                      <p className="text-xs text-slate-400">{order.items?.length ?? 0} поз.</p>
                    </div>

                    {/* Payment */}
                    <div>
                      <p className="text-sm text-slate-600">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
                      <p className={`text-xs font-medium ${payStatus.color}`}>{payStatus.label}</p>
                    </div>

                    {/* Delivery */}
                    <div className="text-sm text-slate-600">
                      {order.npCityName ? (
                        <>
                          <p className="font-medium">{order.npCityName}</p>
                          {order.npBranchName && <p className="text-xs text-slate-400 line-clamp-1">{order.npBranchName}</p>}
                        </>
                      ) : (
                        <span className="text-slate-400">Самовивіз</span>
                      )}
                    </div>

                    {/* Status badge */}
                    <div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.bg} ${status.color} ${status.border}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="hidden lg:flex items-center justify-end">
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <p className="text-sm text-slate-500">
                  Показано {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} з {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = page <= 3 ? i + 1 : page - 2 + i;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition ${
                          p === page
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
