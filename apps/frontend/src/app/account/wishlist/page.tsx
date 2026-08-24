'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/lib/cart';
import { useWishlistStore } from '@/lib/wishlist';

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  stock: number;
}

interface WishlistItem {
  id: string;
  productId: string;
  product: WishlistProduct;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore(s => s.addItem);
  const toggle = useWishlistStore(s => s.toggle);

  useEffect(() => {
    api.get('/wishlist')
      .then(r => setItems(r.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId: string) => {
    await toggle(productId);
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const handleAddToCart = async (item: WishlistItem) => {
    await addToCart({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      oldPrice: item.product.oldPrice,
      image: item.product.image,
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl bg-white p-4 border border-dark/10 animate-pulse">
            <div className="aspect-[4/3] rounded-lg bg-dark-100 mb-4" />
            <div className="h-4 w-3/4 rounded-full bg-dark-100 mb-2" />
            <div className="h-4 w-1/2 rounded-full bg-dark-50" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-white p-16 text-center border border-dark/10">
        <Heart className="h-16 w-16 text-dark-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-dark mb-2">Список бажань порожній</h2>
        <p className="text-dark-400 mb-6">Додайте товари до списку бажань, щоб не загубити їх!</p>
        <Link href="/catalog"
          className="inline-flex items-center gap-2 rounded-lg bg-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-dark-700">
          Переглянути каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-dark">
        Список бажань <span className="text-dark-400 text-lg font-normal">({items.length})</span>
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => {
          const p = item.product;
          const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : null;
          return (
            <div key={item.id} className="rounded-xl bg-white border border-dark/10 overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="relative aspect-[4/3] overflow-hidden bg-dark-50">
                {p.image
                  ? <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="h-full w-full flex items-center justify-center text-dark-200 text-4xl">🐟</div>}
                {discount && (
                  <div className="absolute top-3 left-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
                    -{discount}%
                  </div>
                )}
                <button
                  onClick={() => handleRemove(p.id)}
                  className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-red-500 transition hover:bg-red-50 shadow-sm">
                  <Heart className="h-4 w-4 fill-current" />
                </button>
              </div>
              <div className="p-5">
                <Link href={`/product/${p.slug}`} className="font-semibold text-dark hover:text-dark-600 transition-colors line-clamp-2 text-sm">
                  {p.name}
                </Link>
                <div className="mt-3">
                  <span className="text-xl font-semibold text-dark">{p.price.toLocaleString('uk-UA')} грн</span>
                  {p.oldPrice && (
                    <span className="ml-2 text-sm text-dark-400 line-through">{p.oldPrice.toLocaleString('uk-UA')} грн</span>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={p.stock === 0}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-dark-700 disabled:opacity-50">
                    <ShoppingCart className="h-4 w-4" />
                    {p.stock === 0 ? 'Немає' : 'В кошик'}
                  </button>
                  <Link href={`/product/${p.slug}`}
                    className="flex items-center justify-center rounded-lg border border-dark/10 px-4 py-2.5 text-sm font-medium text-dark-500 transition hover:border-dark/30 hover:text-dark">
                    Деталі
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
