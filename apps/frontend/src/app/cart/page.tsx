'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, ArrowRight, Trash2, Plus, Minus, Package, Truck, PartyPopper, ShieldCheck, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCartStore } from '@/lib/cart';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import { primaryLinkClass } from '@/lib/ui-classes';
import { Shine } from '@/components/shared/interactive';

const DEFAULT_FREE_DELIVERY_THRESHOLD = 1000;

export default function CartPage() {
  const router = useRouter();
  const { items, summary, isLoading, removeItem, updateQuantity, syncFromApi } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(DEFAULT_FREE_DELIVERY_THRESHOLD);
  // Помилки по конкретних товарах (напр. "Недостатньо товару на складі")
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

  const runSafe = async (productId: string, action: () => Promise<void>) => {
    setItemErrors(({ [productId]: _, ...rest }) => rest);
    try {
      await action();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message;
      const text = Array.isArray(msg) ? msg[0] : msg || 'Не вдалося оновити кошик';
      setItemErrors((prev) => ({ ...prev, [productId]: text }));
      setTimeout(() => setItemErrors(({ [productId]: _, ...rest }) => rest), 4000);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      syncFromApi();
    }
  }, [isAuthenticated, syncFromApi]);

  useEffect(() => {
    api.get('/settings/free_shipping_threshold')
      .then(r => {
        const value = Number(r.data?.value);
        if (value > 0) setFreeDeliveryThreshold(value);
      })
      .catch(() => {});
  }, []);

  const toLeft = freeDeliveryThreshold - summary.subtotal;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-surface overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-[0_18px_40px_rgba(13,27,42,0.08)]"
            >
              <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
                <ShoppingCart className="h-10 w-10 text-dark-300" />
              </motion.span>
            </motion.div>
            <h1 className="text-2xl font-semibold text-dark">Ваш кошик порожній</h1>
            <p className="mt-3 text-dark-500">Додайте товари до кошика, щоб оформити замовлення.</p>
            <Link href="/catalog" className={`${primaryLinkClass} mt-8`}>
              <Shine />
              <span className="relative flex items-center gap-2">
                Переглянути каталог
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <Link href="/catalog" className="group inline-flex items-center gap-2 text-sm font-medium text-dark-500 transition-colors hover:text-dark">
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Продовжити покупки
          </Link>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border border-dark/10 bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-lg sm:text-xl font-semibold text-dark">
                  Кошик
                  <span className="ml-2 text-sm font-normal text-dark-400">
                    ({summary.totalItems} {summary.totalItems === 1 ? 'товар' : summary.totalItems < 5 ? 'товари' : 'товарів'})
                  </span>
                </h1>
              </div>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group flex gap-3 overflow-hidden rounded-2xl border border-dark/5 bg-dark-50 p-3 transition-colors duration-300 hover:border-dark/10 hover:bg-white hover:shadow-[0_12px_30px_rgba(13,27,42,0.06)] sm:gap-5 sm:p-4"
                  >
                    {/* Image */}
                    <Link href={`/product/${item.slug}`} className="shrink-0">
                      <div className="h-16 w-16 overflow-hidden rounded-xl bg-white sm:h-20 sm:w-20">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-8 w-8 text-dark-300" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between gap-2 min-w-0">
                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-medium text-dark hover:text-dark-700 transition-colors line-clamp-2 text-sm sm:text-base"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                          <span className="font-semibold text-dark text-sm sm:text-base">
                            {item.price.toLocaleString('uk-UA')} грн
                          </span>
                          {item.oldPrice && item.oldPrice > item.price && (
                            <span className="text-xs sm:text-sm text-dark-400 line-through">
                              {item.oldPrice.toLocaleString('uk-UA')} грн
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {/* Quantity */}
                        <div className="flex items-center gap-1 rounded-xl bg-white p-0.5 shadow-sm">
                          <button
                            onClick={() => runSafe(item.productId, () => updateQuantity(item.productId, item.quantity - 1))}
                            disabled={isLoading}
                            aria-label="Менше"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-dark-500 transition-all hover:bg-dark-50 hover:text-dark active:scale-90 disabled:opacity-40"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                              key={item.quantity}
                              initial={{ y: -8, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: 8, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="w-7 text-center text-sm font-semibold tabular-nums text-dark sm:w-8"
                            >
                              {item.quantity}
                            </motion.span>
                          </AnimatePresence>
                          <button
                            onClick={() => runSafe(item.productId, () => updateQuantity(item.productId, item.quantity + 1))}
                            disabled={isLoading || (item.stock != null && item.quantity >= item.stock)}
                            aria-label="Більше"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-dark-500 transition-all hover:bg-dark-50 hover:text-dark active:scale-90 disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Total + Remove */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="font-semibold text-dark text-sm sm:text-base">
                            {item.total.toLocaleString('uk-UA')} грн
                          </span>
                          <button
                            onClick={() => runSafe(item.productId, () => removeItem(item.productId))}
                            disabled={isLoading}
                            aria-label="Видалити"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-dark-400 transition-all hover:bg-red-50 hover:text-red-600 active:scale-90 disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <AnimatePresence>
                        {(itemErrors[item.productId] || item.stock === 0 || (item.stock != null && item.quantity > item.stock)) && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-1.5 overflow-hidden text-xs font-medium text-red-600"
                          >
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {itemErrors[item.productId]
                              ?? (item.stock === 0 ? 'Товару вже немає в наявності — видаліть його з кошика' : `На складі лише ${item.stock} — зменшіть кількість`)}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6 rounded-3xl border border-dark/10 bg-white p-5 shadow-[0_18px_40px_rgba(13,27,42,0.06)] sm:p-6">
              <h2 className="text-lg font-semibold text-dark">Підсумок</h2>

              {/* Free delivery progress */}
              <AnimatePresence mode="wait" initial={false}>
              {toLeft > 0 ? (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="rounded-2xl bg-dark-50 p-4"
                >
                  <p className="text-sm text-dark-600">
                    До безкоштовної доставки ще{' '}
                    <strong className="text-dark">{toLeft.toLocaleString('uk-UA')} грн</strong>
                  </p>
                  {/* Смуга прогресу з вантажівкою, що їде до мети */}
                  <div className="relative mt-4 h-2 w-full rounded-full bg-dark-200">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary"
                      initial={false}
                      animate={{ width: `${Math.min((summary.subtotal / freeDeliveryThreshold) * 100, 100)}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                    <motion.div
                      className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-md"
                      initial={false}
                      animate={{ left: `${Math.min((summary.subtotal / freeDeliveryThreshold) * 100, 100)}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    >
                      <Truck className="h-3.5 w-3.5" />
                    </motion.div>
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-dark-400">
                    <span>0</span>
                    <span>{freeDeliveryThreshold.toLocaleString('uk-UA')} грн</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="free"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex items-center gap-3 rounded-2xl bg-sage-50 p-4 text-sm font-medium text-sage-600"
                >
                  <motion.span animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <PartyPopper className="h-5 w-5" />
                  </motion.span>
                  Безкоштовна доставка!
                </motion.div>
              )}
              </AnimatePresence>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-500">Товари ({summary.totalItems})</span>
                  <span className="font-medium text-dark">{summary.subtotal.toLocaleString('uk-UA')} грн</span>
                </div>
                {summary.totalDiscount > 0 && (
                  <div className="flex justify-between text-sage-600">
                    <span>Знижка</span>
                    <span>−{summary.totalDiscount.toLocaleString('uk-UA')} грн</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-dark-500">Доставка</span>
                  <span className="font-medium text-dark">{toLeft <= 0 ? 'Безкоштовно' : 'за тарифами НП'}</span>
                </div>
                <div className="border-t border-dark/10 pt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-dark">Загалом</span>
                    <motion.span
                      key={summary.total}
                      initial={{ opacity: 0.4, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg tabular-nums text-dark"
                    >
                      {summary.total.toLocaleString('uk-UA')} грн
                    </motion.span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                disabled={isLoading}
                className={`${primaryLinkClass} w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <Shine />
                <span className="relative flex items-center gap-2">
                  {isLoading ? 'Завантаження...' : 'Оформити замовлення'}
                  {!isLoading && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
                </span>
              </button>

              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-dark-400">
                <ShieldCheck className="h-3.5 w-3.5 text-sage" />
                Безпечна оплата · HACCP сертифікат · Доставка НП
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
