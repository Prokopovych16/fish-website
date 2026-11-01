'use client';

import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlistStore } from '@/lib/wishlist';

export function WishlistButton({ productId }: { productId: string }) {
  const { has, toggle } = useWishlistStore();
  const inWishlist = has(productId);

  return (
    <button
      onClick={() => toggle(productId)}
      className={`group flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border px-5 text-sm font-medium transition-all duration-300 active:scale-[0.98] ${
        inWishlist
          ? 'border-red-100 bg-red-50 text-red-500'
          : 'border-transparent bg-dark-50 text-dark-500 hover:bg-dark-100 hover:text-dark'
      }`}
    >
      <motion.span
        key={String(inWishlist)}
        initial={{ scale: 0.6 }}
        animate={{ scale: [0.6, 1.3, 1] }}
        transition={{ duration: 0.35 }}
        className="flex"
      >
        <Heart className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" fill={inWishlist ? 'currentColor' : 'none'} />
      </motion.span>
      {inWishlist ? 'В обраному' : 'Додати в обране'}
    </button>
  );
}
