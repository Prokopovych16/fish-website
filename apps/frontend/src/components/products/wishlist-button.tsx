'use client';

import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/lib/wishlist';

export function WishlistButton({ productId }: { productId: string }) {
  const { has, toggle } = useWishlistStore();
  const inWishlist = has(productId);

  return (
    <button
      onClick={() => toggle(productId)}
      className={`flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors ${
        inWishlist
          ? 'border-dark/15 bg-dark/5 text-dark'
          : 'border-dark/15 bg-white text-dark-500 hover:text-dark'
      }`}
    >
      <Heart className="h-4 w-4" fill={inWishlist ? 'currentColor' : 'none'} />
      {inWishlist ? 'В обраному' : 'Додати в обране'}
    </button>
  );
}
