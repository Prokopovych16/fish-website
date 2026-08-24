'use client';

import { useState } from 'react';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
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
};

export function AddToCartButton({ product }: Props) {
  const { addItem, isLoading } = useCartStore();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (product.stock === 0 || added || isLoading) return;
    setError('');
    try {
      await addItem(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Не вдалося додати до кошика');
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
        className={`w-full rounded-lg px-5 py-3.5 text-sm font-medium text-white transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
          added ? 'bg-sage-600' : error ? 'bg-red-600' : 'bg-dark hover:bg-dark-700'
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
