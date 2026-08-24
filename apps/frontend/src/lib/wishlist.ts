import { create } from 'zustand';
import api from './api';

type WishlistState = {
  ids: Set<string>;
  toggle: (productId: string) => Promise<boolean>;
  load: () => Promise<void>;
  has: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  ids: new Set(),

  has: (productId) => get().ids.has(productId),

  load: async () => {
    if (!api.defaults.headers.common['Authorization']) return;
    try {
      const res = await api.get('/wishlist');
      const ids = new Set<string>((res.data as any[]).map((item: any) => item.productId));
      set({ ids });
    } catch {
      // not authenticated or network error
    }
  },

  toggle: async (productId) => {
    if (!api.defaults.headers.common['Authorization']) return false;
    try {
      const res = await api.post(`/wishlist/${productId}`);
      const added = res.data.added as boolean;
      set(state => {
        const next = new Set(state.ids);
        if (added) next.add(productId);
        else next.delete(productId);
        return { ids: next };
      });
      return added;
    } catch {
      return false;
    }
  },
}));
