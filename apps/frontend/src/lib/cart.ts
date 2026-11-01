import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';
import { pixel } from './pixel';

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  quantity: number;
  total: number;
  /** Залишок на складі (якщо відомий) — щоб не дати вибрати більше */
  stock?: number;
};

export type CartSummary = {
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
};

type CartState = {
  items: CartItem[];
  summary: CartSummary;
  isLoading: boolean;

  addItem: (
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      oldPrice?: number | null;
      image?: string | null;
      stock?: number;
    },
    quantity?: number,
  ) => Promise<void>;

  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncFromApi: () => Promise<void>;
  mergeOnLogin: () => Promise<void>;
};

function computeSummary(items: CartItem[]): CartSummary {
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const totalDiscount = items.reduce((s, i) => {
    if (i.oldPrice && i.oldPrice > i.price) {
      return s + (i.oldPrice - i.price) * i.quantity;
    }
    return s;
  }, 0);
  return { totalItems, subtotal, totalDiscount, total: subtotal };
}

function normalizeApiCart(data: any): CartItem[] {
  return (data.items ?? []).map((item: any) => ({
    productId: item.productId,
    name: item.product?.name ?? '',
    slug: item.product?.slug ?? '',
    price: Number(item.price),
    oldPrice: item.product?.oldPrice != null ? Number(item.product.oldPrice) : null,
    image: item.product?.image ?? null,
    quantity: item.quantity,
    total: Number(item.total),
    stock: item.product?.stock != null ? Number(item.product.stock) : undefined,
  }));
}

function isAuthenticated(): boolean {
  return !!api.defaults.headers.common['Authorization'];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      summary: { totalItems: 0, subtotal: 0, totalDiscount: 0, total: 0 },
      isLoading: false,

      addItem: async (product, quantity = 1) => {
        pixel.addToCart(product.name, product.id, product.price, quantity);
        if (isAuthenticated()) {
          set({ isLoading: true });
          try {
            const res = await api.post('/cart/items', {
              productId: product.id,
              quantity,
            });
            const items = normalizeApiCart(res.data);
            set({ items, summary: computeSummary(items), isLoading: false });
            return;
          } catch (e: any) {
            set({ isLoading: false });
            // Сесія недійсна навіть після спроби оновлення токена — падаємо в гостьовий режим нижче,
            // а не показуємо користувачу помилку "не авторизовано"
            if (e?.response?.status !== 401) throw e;
            delete api.defaults.headers.common['Authorization'];
          }
        }
        {
          const { items } = get();
          const existing = items.find((i) => i.productId === product.id);
          const stock = product.stock ?? existing?.stock;
          const wanted = (existing?.quantity ?? 0) + quantity;
          if (stock != null && wanted > stock) {
            throw new Error(stock > 0 ? `Доступно лише ${stock}` : 'Товару немає в наявності');
          }
          let updated: CartItem[];
          if (existing) {
            updated = items.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: wanted, total: i.price * wanted, stock: stock ?? i.stock }
                : i,
            );
          } else {
            updated = [
              ...items,
              {
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: Number(product.price),
                oldPrice: product.oldPrice != null ? Number(product.oldPrice) : null,
                image: product.image ?? null,
                quantity,
                total: Number(product.price) * quantity,
                stock,
              },
            ];
          }
          set({ items: updated, summary: computeSummary(updated) });
        }
      },

      removeItem: async (productId) => {
        if (isAuthenticated()) {
          set({ isLoading: true });
          try {
            const res = await api.delete(`/cart/items/${productId}`);
            const items = normalizeApiCart(res.data);
            set({ items, summary: computeSummary(items), isLoading: false });
            return;
          } catch (e: any) {
            set({ isLoading: false });
            if (e?.response?.status !== 401) throw e;
            delete api.defaults.headers.common['Authorization'];
          }
        }
        {
          const updated = get().items.filter((i) => i.productId !== productId);
          set({ items: updated, summary: computeSummary(updated) });
        }
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity < 1) {
          return get().removeItem(productId);
        }
        if (isAuthenticated()) {
          set({ isLoading: true });
          try {
            const res = await api.put(`/cart/items/${productId}`, { quantity });
            const items = normalizeApiCart(res.data);
            set({ items, summary: computeSummary(items), isLoading: false });
            return;
          } catch (e: any) {
            set({ isLoading: false });
            if (e?.response?.status !== 401) throw e;
            delete api.defaults.headers.common['Authorization'];
          }
        }
        {
          const current = get().items.find((i) => i.productId === productId);
          if (current?.stock != null && quantity > current.stock) {
            throw new Error(current.stock > 0 ? `Доступно лише ${current.stock}` : 'Товару немає в наявності');
          }
          const updated = get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity, total: i.price * quantity }
              : i,
          );
          set({ items: updated, summary: computeSummary(updated) });
        }
      },

      clearCart: async () => {
        // Кошик завжди очищається локально, навіть якщо запит на сервер
        // не вдався (наприклад, сесія вже закінчилась) — це не повинно
        // блокувати клієнта після успішного оформлення замовлення.
        if (isAuthenticated()) {
          set({ isLoading: true });
          try {
            await api.delete('/cart');
          } catch (e) {
            // ігноруємо — кошик все одно очищується нижче
          }
        }
        set({ items: [], summary: computeSummary([]), isLoading: false });
      },

      syncFromApi: async () => {
        if (!isAuthenticated()) return;
        set({ isLoading: true });
        try {
          const res = await api.get('/cart');
          const items = normalizeApiCart(res.data);
          set({ items, summary: computeSummary(items), isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      // Викликається одразу після успішного логіну
      mergeOnLogin: async () => {
        const { items } = get();
        const guestItems = items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        }));

        set({ isLoading: true });
        try {
          const res = await api.post('/cart/merge', { items: guestItems });
          const merged = normalizeApiCart(res.data);
          set({ items: merged, summary: computeSummary(merged), isLoading: false });
        } catch {
          // Якщо merge впав — просто підтягнути кошик з API
          try {
            const res = await api.get('/cart');
            const apiItems = normalizeApiCart(res.data);
            set({ items: apiItems, summary: computeSummary(apiItems), isLoading: false });
          } catch {
            set({ isLoading: false });
          }
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.summary = computeSummary(state.items);
        }
      },
    },
  ),
);
