'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, Save, User, MapPin, CreditCard,
} from 'lucide-react';
import api from '@/lib/api';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Очікує підтвердження' },
  { value: 'CONFIRMED', label: 'Підтверджено' },
  { value: 'PROCESSING', label: 'В обробці' },
  { value: 'SHIPPED', label: 'Відправлено' },
  { value: 'DELIVERED', label: 'Доставлено' },
  { value: 'CANCELLED', label: 'Скасовано' },
  { value: 'REFUNDED', label: 'Повернення' },
];

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; icon: React.ElementType }> = {
  PENDING:    { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: Clock },
  CONFIRMED:  { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',    icon: CheckCircle },
  PROCESSING: { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: Package },
  SHIPPED:    { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Truck },
  DELIVERED:  { color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200',icon: CheckCircle },
  CANCELLED:  { color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       icon: XCircle },
  REFUNDED:   { color: 'text-slate-700',  bg: 'bg-slate-100 border-slate-200',  icon: XCircle },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'Накладений платіж',
  CARD_ONLINE: 'Картка онлайн',
  LIQPAY: 'LiqPay',
  FONDY: 'Fondy',
};

const DELIVERY_METHOD_LABELS: Record<string, string> = {
  NOVA_POSHTA_BRANCH: 'Нова Пошта (відділення)',
  NOVA_POSHTA_COURIER: 'Нова Пошта (кур\'єр)',
  PICKUP: 'Самовивіз',
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const [statusForm, setStatusForm] = useState({
    status: '' as OrderStatus,
    adminNote: '',
    npTrackingNumber: '',
  });

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => {
        setOrder(r.data);
        setStatusForm({
          status: r.data.status,
          adminNote: r.data.adminNote ?? '',
          npTrackingNumber: r.data.npTrackingNumber ?? '',
        });
      })
      .catch(() => router.push('/admin/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/orders/${id}/status`, statusForm);
      setOrder(res.data);
      setSavedMsg('Збережено');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch {
      setSavedMsg('Помилка збереження');
      setTimeout(() => setSavedMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-[2rem] bg-white" />)}
      </div>
    );
  }

  if (!order) return null;

  const statusCfg = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admin/orders')}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-dark">Замовлення {order.orderNumber}</h1>
          <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className={`ml-auto flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
          <StatusIcon className="h-4 w-4" />
          {STATUS_OPTIONS.find(s => s.value === order.status)?.label}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Items */}
          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-5 font-semibold text-dark">Товари ({order.items?.length ?? 0})</h2>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3">
                  {item.productImage && (
                    <img src={item.productImage} alt={item.productName} className="h-14 w-14 rounded-xl object-cover bg-slate-200 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark line-clamp-1">{item.productName}</p>
                    <p className="text-sm text-slate-500">{item.quantity} × {Number(item.price).toLocaleString('uk-UA')} грн</p>
                  </div>
                  <p className="font-semibold text-dark">{Number(item.total).toLocaleString('uk-UA')} грн</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-1 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between text-slate-600"><span>Підсумок</span><span>{Number(order.subtotal).toLocaleString('uk-UA')} грн</span></div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Знижка</span><span>-{Number(order.discountAmount).toLocaleString('uk-UA')} грн</span></div>
              )}
              <div className="flex justify-between text-slate-600"><span>Доставка</span><span>{Number(order.deliveryCost).toLocaleString('uk-UA')} грн</span></div>
              <div className="flex justify-between text-lg font-bold text-dark"><span>Загалом</span><span>{Number(order.total).toLocaleString('uk-UA')} грн</span></div>
            </div>
          </div>

          {/* Status history */}
          {order.statusHistory?.length > 0 && (
            <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
              <h2 className="mb-4 font-semibold text-dark">Історія статусів</h2>
              <div className="space-y-3">
                {order.statusHistory.map((h: any) => (
                  <div key={h.id} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    <div>
                      <p className="font-medium text-dark">{STATUS_OPTIONS.find(s => s.value === h.status)?.label ?? h.status}</p>
                      {h.comment && <p className="text-slate-500">{h.comment}</p>}
                      <p className="text-slate-400 text-xs">{new Date(h.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Status update */}
          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-5 font-semibold text-dark">Змінити статус</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Статус замовлення</label>
                <select value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value as OrderStatus }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none">
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">ТТН Нової Пошти</label>
                <input value={statusForm.npTrackingNumber} onChange={e => setStatusForm(f => ({ ...f, npTrackingNumber: e.target.value }))}
                  placeholder="20400000000000"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Нотатка менеджера</label>
                <textarea value={statusForm.adminNote} onChange={e => setStatusForm(f => ({ ...f, adminNote: e.target.value }))}
                  rows={3} placeholder="Внутрішня нотатка..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none resize-none" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60">
                <Save className="h-4 w-4" />
                {saving ? 'Збереження...' : 'Зберегти'}
              </button>
              {savedMsg && (
                <p className={`text-center text-sm ${savedMsg.includes('Помилка') ? 'text-red-600' : 'text-emerald-600'}`}>{savedMsg}</p>
              )}
            </div>
          </div>

          {/* Customer info */}
          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-4 font-semibold text-dark flex items-center gap-2"><User className="h-4 w-4 text-primary" />Покупець</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-dark">{order.contactFirstName} {order.contactLastName}</p>
              <p className="text-slate-500">{order.contactPhone}</p>
              <p className="text-slate-500">{order.contactEmail}</p>
              {order.user && <p className="text-xs text-primary">Зареєстрований клієнт</p>}
            </div>
          </div>

          {/* Delivery info */}
          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-4 font-semibold text-dark flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Доставка</h2>
            <div className="space-y-1.5 text-sm text-slate-600">
              <p>{DELIVERY_METHOD_LABELS[order.deliveryMethod] ?? order.deliveryMethod}</p>
              {order.npCityName && <p>{order.npCityName}</p>}
              {order.npBranchName && <p>{order.npBranchName}</p>}
              {order.deliveryAddress && <p>{order.deliveryAddress}</p>}
              {order.npTrackingNumber && (
                <p className="font-medium text-dark">ТТН: {order.npTrackingNumber}</p>
              )}
            </div>
          </div>

          {/* Payment info */}
          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-4 font-semibold text-dark flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Оплата</h2>
            <div className="space-y-1.5 text-sm text-slate-600">
              <p>{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
              <p className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-orange-600'}`}>
                {order.paymentStatus === 'PAID' ? 'Оплачено' : order.paymentStatus === 'PENDING' ? 'Очікує оплати' : order.paymentStatus}
              </p>
            </div>
          </div>

          {order.comment && (
            <div className="rounded-[2rem] bg-amber-50 border border-amber-200 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">Коментар покупця</p>
              <p className="text-sm text-slate-700">{order.comment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
