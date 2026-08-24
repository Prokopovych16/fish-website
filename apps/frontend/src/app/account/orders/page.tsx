'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';

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
          <div key={i} className="rounded-xl bg-white p-8 border border-dark/10 animate-pulse">
            <div className="h-5 w-40 rounded-full bg-dark-100 mb-3" />
            <div className="h-4 w-24 rounded-full bg-dark-50" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl bg-white p-16 text-center border border-dark/10">
        <ShoppingBag className="h-16 w-16 text-dark-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-dark mb-2">Замовлень ще немає</h2>
        <p className="text-dark-400 mb-6">Почніть з нашого каталогу та зробіть перше замовлення!</p>
        <Link href="/catalog" className="inline-flex items-center gap-2 rounded-lg bg-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-dark-700">
          До каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-dark">Мої замовлення</h1>
      {orders.map((order: any) => {
        const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['PENDING'];
        const StatusIcon = status.icon;
        const isOpen = expanded === order.id;

        return (
          <div key={order.id} className="rounded-xl bg-white border border-dark/10 overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="flex w-full items-center justify-between px-8 py-6 text-left hover:bg-dark-50 transition"
            >
              <div className="flex items-center gap-6">
                <div>
                  <p className="font-semibold text-dark">#{order.orderNumber}</p>
                  <p className="text-sm text-dark-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className={`hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${status.bg} ${status.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-dark">{Number(order.total).toLocaleString('uk-UA')} грн</p>
                  <p className="text-xs text-dark-400">{order.items?.length ?? 0} поз.</p>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-dark-400" /> : <ChevronDown className="h-4 w-4 text-dark-400" />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-dark/10 px-8 py-6 space-y-5">
                {/* Status mobile */}
                <div className={`sm:hidden inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${status.bg} ${status.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg bg-dark-50 p-3">
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
                <div className="rounded-lg bg-dark-50 p-4 text-sm space-y-1">
                  <p className="font-medium text-dark">Доставка</p>
                  {order.npCityName && <p className="text-dark-400">{order.npCityName}{order.npBranchName ? `, ${order.npBranchName}` : ''}</p>}
                  {order.npTrackingNumber && <p className="text-dark-400">ТТН: <span className="font-medium text-dark">{order.npTrackingNumber}</span></p>}
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
                    className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Скасувати замовлення
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
