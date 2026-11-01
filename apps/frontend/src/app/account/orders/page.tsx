'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ShoppingBag, Copy, Check, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '@/lib/api';
import { LiveDot, Reveal, Shine } from '@/components/shared/interactive';
import { primaryLinkClass } from '@/lib/ui-classes';

// Етапи доставки для трекера (CANCELLED / REFUNDED показуються окремо)
const TRACK = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;
const TRACK_LABELS: Record<string, string> = {
  PENDING: 'Новий', CONFIRMED: 'Підтверджено', PROCESSING: 'Збираємо', SHIPPED: 'В дорозі', DELIVERED: 'Доставлено',
};

/** Горизонтальний трекер статусу замовлення */
function OrderTracker({ status }: { status: string }) {
  const current = TRACK.indexOf(status as typeof TRACK[number]);
  if (current < 0) return null;
  return (
    <div className="relative px-2 pt-1">
      <div className="absolute left-[10%] right-[10%] top-[18px] h-0.5 overflow-hidden rounded-full bg-dark-100">
        <motion.div
          className="h-full bg-dark"
          initial={{ width: 0 }}
          animate={{ width: `${(current / (TRACK.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="relative grid grid-cols-5">
        {TRACK.map((s, i) => {
          const Icon = STATUS_CONFIG[s].icon;
          const reached = i <= current;
          return (
            <div key={s} className="flex flex-col items-center gap-2 text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 400, damping: 22 }}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${reached ? 'bg-dark text-white' : 'bg-white text-dark-300 ring-1 ring-dark/10'}`}
              >
                {i === current && s !== 'DELIVERED' && <span className="absolute inset-0 animate-ping rounded-full bg-dark/20" />}
                <Icon className="h-4 w-4" />
              </motion.div>
              <span className={`text-[11px] font-medium leading-tight ${reached ? 'text-dark' : 'text-dark-400'}`}>{TRACK_LABELS[s]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** ТТН з кнопкою копіювання */
function TrackingNumber({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="group inline-flex items-center gap-2 rounded-lg bg-white px-2.5 py-1 font-medium text-dark shadow-sm transition-all hover:shadow-md active:scale-95"
    >
      {value}
      {copied ? <Check className="h-3.5 w-3.5 text-sage-600" /> : <Copy className="h-3.5 w-3.5 text-dark-400 group-hover:text-dark" />}
    </button>
  );
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING:    { label: 'Очікує підтвердження', color: 'text-dark-600',  bg: 'bg-dark-50',  icon: Clock },
  CONFIRMED:  { label: 'Підтверджено',         color: 'text-dark-600',  bg: 'bg-dark-50',  icon: CheckCircle },
  PROCESSING: { label: 'В обробці',            color: 'text-dark-600',  bg: 'bg-dark-50',  icon: Package },
  SHIPPED:    { label: 'Відправлено',          color: 'text-dark-600',  bg: 'bg-dark-50',  icon: Truck },
  DELIVERED:  { label: 'Доставлено',           color: 'text-sage-600',  bg: 'bg-sage-50',  icon: CheckCircle },
  CANCELLED:  { label: 'Скасовано',            color: 'text-red-600',   bg: 'bg-red-50',   icon: XCircle },
  REFUNDED:   { label: 'Повернення',           color: 'text-dark-500',  bg: 'bg-dark-50',  icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.get('/orders/user/my').then(r => {
      const raw = r.data;
      setOrders(Array.isArray(raw) ? raw : (raw?.data ?? raw?.orders ?? []));
    }).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse rounded-3xl border border-dark/10 bg-white p-8">
            <div className="h-5 w-40 rounded-full bg-dark-100 mb-3" />
            <div className="h-4 w-24 rounded-full bg-dark-50" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dark/10 bg-white p-16 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-dark-50">
          <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
            <ShoppingBag className="h-10 w-10 text-dark-300" />
          </motion.span>
        </div>
        <h2 className="text-xl font-semibold text-dark mb-2">Замовлень ще немає</h2>
        <p className="text-dark-400 mb-6">Почніть з нашого каталогу та зробіть перше замовлення!</p>
        <Link href="/catalog" className={primaryLinkClass}>
          <Shine />
          <span className="relative flex items-center gap-2">
            До каталогу <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-dark">Мої замовлення</h1>
      {orders.map((order: any, idx: number) => {
        const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['PENDING'];
        const StatusIcon = status.icon;
        const isOpen = expanded === order.id;

        return (
          <Reveal key={order.id} index={idx % 6}>
          <div className={`overflow-hidden rounded-3xl border bg-white transition-all duration-300 ${isOpen ? 'border-dark/15 shadow-[0_18px_40px_rgba(13,27,42,0.08)]' : 'border-dark/10 hover:border-dark/15 hover:shadow-[0_12px_30px_rgba(13,27,42,0.06)]'}`}>
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-8 sm:py-6"
            >
              <div className="flex items-center gap-6">
                <div>
                  <p className="font-semibold text-dark">#{order.orderNumber}</p>
                  <p className="text-sm text-dark-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className={`hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${status.bg} ${status.color}`}>
                  {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(order.status) ? <LiveDot tone={order.status === 'SHIPPED' ? 'orange' : 'sage'} /> : <StatusIcon className="h-3.5 w-3.5" />}
                  {status.label}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-dark">{Number(order.total).toLocaleString('uk-UA')} грн</p>
                  <p className="text-xs text-dark-400">{order.items?.length ?? 0} поз.</p>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${isOpen ? 'bg-dark text-white' : 'bg-dark-50 text-dark-400'}`}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
              </div>
            </button>

            <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden"
              >
              <div className="space-y-5 border-t border-dark/5 px-5 py-6 sm:px-8">
                <OrderTracker status={order.status} />
                {/* Status mobile */}
                <div className={`sm:hidden inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${status.bg} ${status.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 rounded-2xl bg-dark-50 p-3">
                      {item.productImage && <img src={item.productImage} alt={item.productName} className="h-12 w-12 rounded-xl object-cover bg-dark-100 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-dark line-clamp-1">{item.productName}</p>
                        <p className="text-sm text-dark-400">{item.quantity} × {Number(item.price).toLocaleString('uk-UA')} грн</p>
                      </div>
                      <p className="font-semibold text-dark">{Number(item.total).toLocaleString('uk-UA')} грн</p>
                    </div>
                  ))}
                </div>

                {/* Delivery info */}
                <div className="space-y-1.5 rounded-2xl bg-dark-50 p-4 text-sm">
                  <p className="font-medium text-dark">Доставка</p>
                  {order.npCityName && <p className="text-dark-400">{order.npCityName}{order.npBranchName ? `, ${order.npBranchName}` : ''}</p>}
                  {order.npTrackingNumber && <p className="flex items-center gap-2 text-dark-400">ТТН: <TrackingNumber value={order.npTrackingNumber} /></p>}
                  {order.deliveryAddress && <p className="text-dark-400">{order.deliveryAddress}</p>}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center border-t border-dark/10 pt-4">
                  <span className="font-semibold text-dark">Загалом</span>
                  <span className="text-lg font-bold text-dark">{Number(order.total).toLocaleString('uk-UA')} грн</span>
                </div>

                {/* Actions */}
                {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                  <button
                    onClick={async () => {
                      if (!confirm('Скасувати це замовлення?')) return;
                      try {
                        await api.patch(`/orders/${order.id}/cancel`, { reason: 'Скасовано покупцем' });
                        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'CANCELLED' } : o));
                      } catch (e: any) {
                        alert(e?.response?.data?.message || 'Не вдалося скасувати замовлення');
                      }
                    }}
                    className="min-h-[44px] rounded-xl border border-red-200 px-5 text-sm font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-50 active:scale-[0.98]"
                  >
                    Скасувати замовлення
                  </button>
                )}
              </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
          </Reveal>
        );
      })}
    </div>
  );
}
