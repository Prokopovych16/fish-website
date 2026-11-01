'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Check, AlertCircle, Zap, Loader2, Minus, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCartStore } from '@/lib/cart';

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    oldPrice?: number | null;
    image?: string | null;
    stock: number;
  };
  /** Скільки одиниць додати (за замовчуванням 1) */
  quantity?: number;
};

/** Текст помилки з відповіді API або локальної перевірки залишку */
function errorMessage(e: any, fallback: string): string {
  const msg = e?.response?.data?.message ?? e?.message;
  return Array.isArray(msg) ? msg[0] : msg || fallback;
}

export function AddToCartButton({ product, quantity = 1 }: Props) {
  const { addItem, isLoading } = useCartStore();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (product.stock === 0 || added || isLoading) return;
    setError('');
    try {
      await addItem(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (e: any) {
      setError(errorMessage(e, 'Не вдалося додати до кошика'));
      setTimeout(() => setError(''), 3000);
    }
  };

  if (product.stock === 0) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-lg border border-dark/10 bg-dark-50 px-5 py-3.5 text-sm font-medium text-dark-400"
      >
        Немає в наявності
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleAdd}
        disabled={isLoading}
        className={`w-full rounded-lg border px-5 py-3.5 text-sm font-medium transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
          added
            ? 'border-sage-600 bg-sage-600 text-white'
            : error
              ? 'border-red-600 bg-red-600 text-white'
              : 'border-dark/15 bg-white text-dark hover:border-dark hover:bg-dark hover:text-white'
        }`}
      >
        <span className="flex items-center justify-center gap-2">
          {added ? (
            <><Check className="h-4 w-4" /> Додано до кошика</>
          ) : error ? (
            <><AlertCircle className="h-4 w-4" /> {error}</>
          ) : isLoading ? (
            'Завантаження...'
          ) : (
            <><ShoppingCart className="h-4 w-4" /> Додати в кошик</>
          )}
        </span>
      </button>
    </div>
  );
}

/**
 * Моментальна покупка: додає товар у кошик (якщо його там ще немає) і одразу веде на оформлення.
 */
export function BuyNowButton({ product, quantity = 1 }: Props) {
  const router = useRouter();
  const { items, addItem, updateQuantity } = useCartStore();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  if (product.stock === 0) return null;

  const handleBuy = async () => {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      // Якщо товар уже в кошику — ставимо вибрану кількість (а не додаємо зверху), інакше додаємо
      const inCart = items.find((i) => i.productId === product.id);
      if (inCart) {
        if (inCart.quantity !== quantity) await updateQuantity(product.id, quantity);
      } else {
        await addItem(product, quantity);
      }
      router.push('/checkout');
    } catch (e: any) {
      setError(errorMessage(e, 'Не вдалося оформити покупку'));
      setPending(false);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <button
      onClick={handleBuy}
      disabled={pending}
      className={`group relative w-full overflow-hidden rounded-lg px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(22,24,28,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(22,24,28,0.26)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 ${
        error ? 'bg-red-600' : 'bg-dark hover:bg-dark-700'
      }`}
    >
      {/* Shine-ефект при наведенні */}
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20 transition-all duration-700 group-hover:left-[120%]" />
      <span className="relative flex items-center justify-center gap-2">
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Переходимо до оформлення...</>
        ) : error ? (
          <><AlertCircle className="h-4 w-4" /> {error}</>
        ) : (
          <><Zap className="h-4 w-4" /> Купити зараз</>
        )}
      </span>
    </button>
  );
}

/**
 * Блок покупки на сторінці товару: вибір кількості + «Купити зараз» + «В кошик».
 * Кількість обмежена залишком на складі.
 */
export function ProductPurchase({ product, unit }: Props & { unit: string }) {
  const [qty, setQty] = useState(1);
  const max = Math.max(1, Math.min(product.stock, 99));
  const change = (delta: number) => setQty((q) => Math.max(1, Math.min(max, q + delta)));

  return (
    <div className="space-y-3">
      {product.stock > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-dark-50 p-1.5 pl-4">
          <span className="text-sm font-medium text-dark-500">Кількість, {unit}</span>
          <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => change(-1)}
              disabled={qty <= 1}
              aria-label="Менше"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-dark-500 transition-all hover:bg-dark-50 hover:text-dark active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={qty}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-10 text-center text-base font-semibold tabular-nums text-dark"
              >
                {qty}
              </motion.span>
            </AnimatePresence>
            <button
              type="button"
              onClick={() => change(1)}
              disabled={qty >= max}
              aria-label="Більше"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-dark-500 transition-all hover:bg-dark-50 hover:text-dark active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {product.stock > 0 && qty >= max && product.stock <= 99 && (
        <p className="px-1 text-xs text-dark-400">Це весь залишок на складі</p>
      )}
      {product.stock > 0 && qty > 1 && (
        <p className="px-1 text-sm text-dark-500">
          Разом: <span className="font-semibold tabular-nums text-dark">{(product.price * qty).toLocaleString('uk-UA')} грн</span>
        </p>
      )}
      <BuyNowButton product={product} quantity={qty} />
      <AddToCartButton product={product} quantity={qty} />
    </div>
  );
}
