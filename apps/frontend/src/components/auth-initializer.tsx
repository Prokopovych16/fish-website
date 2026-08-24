'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useWishlistStore } from '@/lib/wishlist';

export function AuthInitializer() {
  const { isAuthenticated, _hasHydrated, refreshUser } = useAuthStore();
  const loadWishlist = useWishlistStore(s => s.load);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (isAuthenticated) {
      refreshUser().catch(() => {});
      loadWishlist();
    }
  }, [_hasHydrated]);

  return null;
}
