'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, ShoppingCart } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/lib/cart';

type FlashSaleProduct = {
  productId: string;
  salePrice: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: { url: string; isMain: boolean }[];
  };
};

type FlashSale = {
  id: string;
  name: string;
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
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-xl font-semibold text-white">
        {String(value).padStart(2, '0')}
      </div>
      <span className="mt-1 text-xs text-white/50">{label}</span>
    </div>
  );
}

function FlashProductCard({ item, onAdd }: { item: FlashSaleProduct; onAdd: (item: FlashSaleProduct) => void }) {
  const img = item.product.images?.[0]?.url;
  const discount = Math.round((1 - Number(item.salePrice) / Number(item.product.price)) * 100);

  return (
    <div className="group overflow-hidden rounded-xl border border-dark/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/product/${item.product.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-dark-50">
          {img ? (
            <Image src={img} alt={item.product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">🐟</div>
          )}
          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded-md bg-dark px-2 py-1 text-xs font-medium text-white">
              −{discount}%
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-dark line-clamp-2">{item.product.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-semibold text-dark">{Number(item.salePrice).toLocaleString('uk-UA')} грн</span>
            <span className="text-sm text-dark-400 line-through">{Number(item.product.price).toLocaleString('uk-UA')} грн</span>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={() => onAdd(item)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-dark py-2.5 text-sm font-medium text-white transition-colors hover:bg-dark-700 active:scale-[0.98]"
        >
          <ShoppingCart className="h-4 w-4" />
          В кошик
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
        <div className="mb-8 overflow-hidden rounded-xl bg-dark px-8 py-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-white/50">Флеш-розпродаж</p>
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
        </div>

        {/* Products grid */}
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sale.products.slice(0, 8).map(item => (
            <FlashProductCard key={item.productId} item={item} onAdd={handleAdd} />
          ))}
        </div>
      </div>
    </section>
  );
}
