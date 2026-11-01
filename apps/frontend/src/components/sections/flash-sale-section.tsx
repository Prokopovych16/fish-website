'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, ShoppingCart, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '@/lib/api';
import { useCartStore } from '@/lib/cart';
import { FitImage } from '../products/fit-image';
import { LiveDot, Reveal, Shine } from '../shared/interactive';
import { cardClass } from '@/lib/ui-classes';

type FlashSaleProduct = {
  productId: string;
  salePrice: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    unit: string;
    images: { url: string; isMain: boolean }[];
  };
};

type FlashSale = {
  id: string;
  name: string;
  startsAt?: string;
  endsAt: string;
  products: FlashSaleProduct[];
};

function useCountdown(endsAt: string) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return timeLeft;
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/10 text-xl font-semibold tabular-nums text-white backdrop-blur">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 text-xs text-white/50">{label}</span>
    </div>
  );
}

function FlashProductCard({ item, onAdd }: { item: FlashSaleProduct; onAdd: (item: FlashSaleProduct) => void }) {
  const [added, setAdded] = useState(false);
  const img = item.product.images?.[0]?.url;
  const discount = Math.round((1 - Number(item.salePrice) / Number(item.product.price)) * 100);

  return (
    <div className={`${cardClass} flex h-full flex-col overflow-hidden`}>
      <Link href={`/product/${item.product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-dark-50">
          {img ? (
            <FitImage src={img} alt={item.product.name} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">🐟</div>
          )}
          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-orange-400 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              −{discount}%
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-dark line-clamp-2">{item.product.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-semibold text-dark">{Number(item.salePrice).toLocaleString('uk-UA')} грн<span className="ml-0.5 text-xs font-medium text-dark-400">/{item.product.unit}</span></span>
            <span className="text-sm text-dark-400 line-through">{Number(item.product.price).toLocaleString('uk-UA')} грн</span>
          </div>
        </div>
      </Link>
      <div className="mt-auto px-4 pb-4">
        <button
          onClick={() => {
            onAdd(item);
            setAdded(true);
            setTimeout(() => setAdded(false), 1800);
          }}
          className={`group/btn relative flex min-h-[44px] w-full items-center justify-center overflow-hidden rounded-xl text-sm font-medium text-white transition-all duration-300 active:scale-[0.98] ${
            added ? 'bg-sage-600' : 'bg-dark hover:bg-dark-700 hover:shadow-[0_8px_20px_rgba(22,24,28,0.2)]'
          }`}
        >
          {!added && <Shine scope="btn" />}
          <span className="relative flex items-center gap-2">
            {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            {added ? 'Додано' : 'В кошик'}
          </span>
        </button>
      </div>
    </div>
  );
}

export function FlashSaleSection() {
  const [sale, setSale] = useState<FlashSale | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    api.get('/flash-sales/active')
      .then(r => setSale(r.data))
      .catch(() => setSale(null))
      .finally(() => setLoading(false));
  }, []);

  const timeLeft = useCountdown(sale?.endsAt ?? new Date(0).toISOString());

  if (loading || !sale) return null;

  // Скільки часу акції вже минуло — для смуги прогресу
  const startMs = sale.startsAt ? new Date(sale.startsAt).getTime() : null;
  const endMs = new Date(sale.endsAt).getTime();
  const elapsed = startMs ? Math.min(1, Math.max(0, (Date.now() - startMs) / (endMs - startMs))) : null;

  const handleAdd = (item: FlashSaleProduct) => {
    addItem({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.salePrice,
      image: item.product.images?.[0]?.url ?? null,
    });
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-dark px-6 py-6 sm:px-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, -12, 12, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-400"
              >
                <Zap className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/50">
                  <LiveDot tone="orange" /> Флеш-розпродаж
                </p>
                <h2 className="text-xl font-semibold text-white">{sale.name}</h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/50">Закінчується через:</span>
              <div className="flex gap-2">
                <TimeUnit value={timeLeft.h} label="год" />
                <TimeUnit value={timeLeft.m} label="хв" />
                <TimeUnit value={timeLeft.s} label="сек" />
              </div>
            </div>
          </div>
          {elapsed !== null && (
            <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-300 to-orange-500"
                initial={{ width: 0 }}
                whileInView={{ width: `${(1 - elapsed) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          )}
        </div>

        {/* Products grid */}
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sale.products.slice(0, 8).map((item, i) => (
            <Reveal key={item.productId} index={i} className="h-full">
              <FlashProductCard item={item} onAdd={handleAdd} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
