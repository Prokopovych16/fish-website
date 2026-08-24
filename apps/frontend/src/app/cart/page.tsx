'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, Package } from 'lucide-react';
import { useCartStore } from '@/lib/cart';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';

const DEFAULT_FREE_DELIVERY_THRESHOLD = 1000;

export default function CartPage() {
  const router = useRouter();
  const { items, summary, isLoading, removeItem, updateQuantity, syncFromApi } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(DEFAULT_FREE_DELIVERY_THRESHOLD);

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
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-dark-50">
              <ShoppingCart className="h-10 w-10 text-dark-400" />
            </div>
            <h1 className="text-2xl font-semibold text-dark">Ваш кошик порожній</h1>
            <p className="mt-3 text-dark-500">Додайте товари до кошика, щоб оформити замовлення.</p>
            <Link
              href="/catalog"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-dark px-6 py-3 text-sm font-medium text-white hover:bg-dark-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Переглянути каталог
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
          <Link href="/catalog" className="inline-flex items-center gap-2 text-dark-500 hover:text-dark transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Продовжити покупки
          </Link>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl bg-white p-4 border border-dark/10 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-lg sm:text-xl font-semibold text-dark">
                  Кошик
                  <span className="ml-2 text-sm font-normal text-dark-400">
                    ({summary.totalItems} {summary.totalItems === 1 ? 'товар' : summary.totalItems < 5 ? 'товари' : 'товарів'})
                  </span>
                </h1>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 rounded-lg border border-dark/10 p-3 sm:gap-5 sm:p-4"
                  >
                    {/* Image */}
                    <Link href={`/product/${item.slug}`} className="shrink-0">
                      <div className="h-16 w-16 overflow-hidden rounded-lg bg-dark-50 sm:h-20 sm:w-20">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
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
                        <div className="flex items-center gap-1 rounded-lg border border-dark/10 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={isLoading}
                            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md text-dark-500 hover:bg-dark/5 transition-colors disabled:opacity-40"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 sm:w-8 text-center text-sm font-medium text-dark">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={isLoading}
                            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md text-dark-500 hover:bg-dark/5 transition-colors disabled:opacity-40"
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
                            onClick={() => removeItem(item.productId)}
                            disabled={isLoading}
                            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md text-dark-400 hover:text-red-600 transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 rounded-xl bg-white p-5 border border-dark/10 space-y-6 sm:p-6">
              <h2 className="text-lg font-semibold text-dark">Підсумок</h2>

              {/* Free delivery progress */}
              {toLeft > 0 && (
                <div className="rounded-lg bg-dark-50 p-4">
                  <p className="text-sm text-dark-600">
                    До безкоштовної доставки ще{' '}
                    <strong className="text-dark">{toLeft.toLocaleString('uk-UA')} грн</strong>
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-dark-200">
                    <div
                      className="h-full rounded-full bg-dark transition-all"
                      style={{ width: `${Math.min((summary.subtotal / freeDeliveryThreshold) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {toLeft <= 0 && (
                <div className="rounded-lg bg-sage-50 p-4 text-sm text-sage-600 font-medium">
                  Безкоштовна доставка!
                </div>
              )}

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
                    <span className="text-dark text-lg">{summary.total.toLocaleString('uk-UA')} грн</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                disabled={isLoading}
                className="w-full rounded-lg bg-dark px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-dark-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Завантаження...' : 'Оформити замовлення →'}
              </button>

              <p className="text-center text-xs text-dark-400">
                Безпечна оплата · HACCP сертифікат · Доставка НП
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
