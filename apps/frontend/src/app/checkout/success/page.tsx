'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Clock, XCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { submitPaymentForm } from '@/lib/submit-payment-form';

type OrderTrack = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'CARD_ONLINE' | 'CASH_ON_DELIVERY' | 'LIQPAY' | 'FONDY';
  total: number;
};

const ONLINE_METHODS = ['CARD_ONLINE', 'LIQPAY', 'FONDY'];
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 2500;

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get('order');

  const [order, setOrder] = useState<OrderTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  const attemptsRef = useRef(0);

  const fetchStatus = async (): Promise<OrderTrack | null> => {
    if (!orderNumber) return null;
    try {
      const res = await api.get(`/orders/track/${orderNumber}`);
      return res.data as OrderTrack;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const tick = async () => {
      const data = await fetchStatus();
      if (cancelled) return;
      setOrder(data);
      setLoading(false);

      const isOnline = data && ONLINE_METHODS.includes(data.paymentMethod);
      const stillPending = data?.paymentStatus === 'PENDING';

      if (isOnline && stillPending && attemptsRef.current < MAX_POLL_ATTEMPTS) {
        attemptsRef.current += 1;
        setPolling(true);
        setTimeout(tick, POLL_INTERVAL_MS);
      } else {
        setPolling(false);
      }
    };

    tick();
    return () => { cancelled = true; };
  }, [orderNumber]);

  const handleRetryPayment = async () => {
    if (!order) return;
    setRetrying(true);
    setRetryError('');
    try {
      const checkout = await api.get(`/payments/checkout?orderId=${order.id}`);
      submitPaymentForm(checkout.data);
    } catch (e: any) {
      setRetrying(false);
      setRetryError(e?.response?.data?.message || 'Не вдалося відкрити форму оплати. Спробуйте пізніше.');
    }
  };

  const isOnline = order && ONLINE_METHODS.includes(order.paymentMethod);
  const isFailed = isOnline && order?.paymentStatus === 'FAILED';
  const isPendingPayment = isOnline && order?.paymentStatus === 'PENDING' && !polling && !loading;
  const needsPayment = isFailed || isPendingPayment;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          {isFailed ? (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <XCircle className="h-11 w-11 text-red-500" />
            </div>
          ) : isPendingPayment || loading || polling ? (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-dark-50">
              <Clock className="h-11 w-11 text-dark-400" />
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-50">
              <CheckCircle className="h-11 w-11 text-sage-600" />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-semibold text-dark">
            {isFailed
              ? 'Оплата не пройшла'
              : loading || polling
                ? 'Перевіряємо статус оплати...'
                : isPendingPayment
                  ? 'Очікуємо підтвердження оплати'
                  : 'Замовлення оформлено!'}
          </h1>
          {orderNumber && (
            <p className="mt-2 text-base font-medium text-dark-500">#{orderNumber}</p>
          )}
          <p className="mt-3 text-dark-500 leading-relaxed">
            {isFailed
              ? 'На жаль, оплату не вдалося провести. Спробуйте ще раз або оберіть інший спосіб оплати.'
              : isPendingPayment
                ? 'Оплату ще не завершено. Натисніть кнопку нижче, щоб перейти до оплати замовлення.'
                : "Дякуємо за покупку! Ми зв'яжемося з вами найближчим часом для підтвердження замовлення."}
          </p>
        </div>

        {needsPayment && (
          <div className="space-y-3">
            <button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-dark px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-dark-700 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Перенаправлення...' : isPendingPayment ? 'Оплатити замовлення' : 'Спробувати оплатити знову'}
            </button>
            {retryError && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{retryError}</p>
            )}
          </div>
        )}

        {!needsPayment && (
          <div className="rounded-xl bg-white p-6 border border-dark/10 space-y-3 text-sm text-left">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-dark-400 mt-0.5 shrink-0" />
              <p className="text-dark-500">Підтвердження замовлення та деталі доставки надійдуть на вашу пошту.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-sage-600 mt-0.5 shrink-0" />
              <p className="text-dark-500">Відстежуйте статус замовлення в особистому кабінеті.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/account/orders"
            className="flex items-center justify-center gap-2 rounded-lg bg-dark px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-dark-700">
            Мої замовлення <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/catalog"
            className="flex items-center justify-center gap-2 rounded-lg border border-dark/15 bg-white px-6 py-3 text-sm font-medium text-dark-600 transition-colors hover:bg-dark/5">
            Продовжити покупки
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
