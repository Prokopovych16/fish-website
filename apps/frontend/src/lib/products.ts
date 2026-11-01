export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  rating: number | null;
  reviewsCount: number;
  stock: number;
  badge?: string;
  image: string;
  images: string[];
  category: string;
  categoryId?: string;
  isHaccp?: boolean;
  tags?: string[];
  origin?: string;
  weight?: number;
  unit: string;
  catchMethod?: string;
  storageConditions?: string;
  expiryDays?: number;
  composition?: string;
  // Харчова цінність на 100 г
  calories?: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  parentId?: string | null;
  children?: Category[];
}

export interface FilterOptions {
  category?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

// Fallback data for development
const fallbackProducts: ProductItem[] = [
  {
    id: '1',
    name: 'Стейк лосося',
    slug: 'steik-lososia',
    shortDescription: 'Соковитий стейк з фермерського лосося.',
    description:
      'Якісний стейк лосося з ніжною текстурою, ідеально підходить для запікання або грилю. Свіжий улов, HACCP сертифікат.',
    price: 399,
    oldPrice: 480,
    discountPercent: 17,
    rating: 4.9,
    reviewsCount: 42,
    stock: 24,
    unit: 'кг',
    badge: 'Хіт продажів',
    isHaccp: true,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    ],
    category: 'Свіжа риба',
    tags: ['свіжа', 'lux', 'стейк'],
  },
  {
    id: '2',
    name: 'Чорна ікра щуки',
    slug: 'chorna-ikra-shchuky',
    shortDescription: 'Преміальна чорна ікра для святкового столу.',
    description:
      'Ексклюзивна чорна ікра щуки з насиченим смаком та кремовою текстурою. Ідеально для закусок та подарунків.',
    price: 1299,
    oldPrice: 1499,
    discountPercent: 13,
    rating: 4.8,
    reviewsCount: 18,
    stock: 12,
    unit: 'кг',
    badge: 'Новинка',
    isHaccp: true,
    image: 'https://images.unsplash.com/photo-1505253211202-48adfd4ec0c0?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1505253211202-48adfd4ec0c0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    ],
    category: 'Делікатеси',
    tags: ['ікра', 'преміум', 'делікатes'],
  },
  {
    id: '3',
    name: 'Набір морепродуктів',
    slug: 'nabir-moreproduktiv',
    shortDescription: 'Креветки, кальмари, мідії — для вечері вдома.',
    description:
      'Комплект свіжих морепродуктів: креветки, мідії, кальмари та гострий соус у подарунок. Готово до приготування.',
    price: 520,
    rating: 4.7,
    reviewsCount: 36,
    stock: 8,
    unit: 'кг',
    badge: 'Акція',
    isHaccp: true,
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80',
    ],
    category: 'Морепродукти',
    tags: ['набір', 'морепродукти', 'akcia'],
  },
];

export interface ProductsResult {
  products: ProductItem[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

/**
 * Серверний fetch з таймаутом та Next.js Data Cache (на відміну від axios,
 * це дозволяє кешувати відповіді на 60с навіть на динамічних маршрутах з searchParams)
 */
async function cachedFetch(path: string, revalidate = 60, timeoutMs = 5000): Promise<Response | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${apiUrl}${path}`, {
      next: { revalidate },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Отримати всі товари з фільтрацією та пошуком
 */
export async function getProducts(filters?: FilterOptions): Promise<ProductItem[]> {
  return (await getProductsPaginated(filters)).products;
}

export async function getProductsPaginated(filters?: FilterOptions): Promise<ProductsResult> {
  const fallback: ProductsResult = {
    products: fallbackProducts,
    pagination: { total: fallbackProducts.length, page: 1, limit: 20, pages: 1 },
  };

  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.sort) params.append('sort', filters.sort);
  if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.inStock) params.append('inStock', 'true');
  params.append('page', (filters?.page ?? 1).toString());
  params.append('limit', (filters?.limit ?? 20).toString());

  const res = await cachedFetch(`/products?${params.toString()}`, 30);
  if (!res) return fallback;

  try {
    const data = await res.json();
    if (!data || !Array.isArray(data.data)) return fallback;

    return {
      products: data.data.map((item: any) => normalizeProduct(item)),
      pagination: data.pagination ?? { total: data.data.length, page: 1, limit: 20, pages: 1 },
    };
  } catch {
    return fallback;
  }
}

/**
 * Отримати товар за slug
 */
export async function getProductBySlug(slug: string): Promise<ProductItem | null> {
  const res = await cachedFetch(`/products/${slug}`, 120);
  if (!res) return fallbackProducts.find((product) => product.slug === slug) ?? null;

  try {
    const data = await res.json();
    return normalizeProduct(data);
  } catch {
    return fallbackProducts.find((product) => product.slug === slug) ?? null;
  }
}

/**
 * Отримати категорії
 */
export async function getCategories(): Promise<Category[]> {
  const res = await cachedFetch('/categories', 300);
  if (!res) return [];

  try {
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Отримати хітові товари (позначені "Хіт продажів" в адмінці).
 * Якщо жоден товар ще не позначений — показуємо найновіші активні товари,
 * щоб блок на головній не зникав, поки каталог тільки наповнюється.
 */
export async function getFeaturedProducts(limit = 6): Promise<ProductItem[]> {
  const res = await cachedFetch(`/products/featured/list?limit=${limit}`, 60);
  if (!res) return fallbackProducts.slice(0, limit);

  try {
    const data = await res.json();
    if (!Array.isArray(data)) return fallbackProducts.slice(0, limit);
    if (data.length === 0) return getProducts({ sort: 'newest', limit });
    return data.map((item: any) => normalizeProduct(item));
  } catch {
    return fallbackProducts.slice(0, limit);
  }
}

/**
 * Отримати нові товари
 */
export async function getNewProducts(limit = 6): Promise<ProductItem[]> {
  return getProducts({ sort: 'newest', limit });
}

/**
 * Decimal-поля Prisma приходять рядками ("0.5") — перетворюємо в число, null/порожнє → undefined
 */
function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Нормалізація даних товару з API
 */
function normalizeProduct(item: any): ProductItem {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    shortDescription: item.shortDescription || item.description?.substring(0, 120) || '',
    description: item.description || '',
    price: Number(item.price),
    oldPrice: item.oldPrice ? Number(item.oldPrice) : undefined,
    discountPercent: item.discountPercent || (item.oldPrice ?
      Math.round(((Number(item.oldPrice) - Number(item.price)) / Number(item.oldPrice)) * 100) : undefined),
    rating: item.rating != null ? Number(item.rating) : (item._count?.reviews > 0 ? 4.5 : null),
    reviewsCount: item.reviewsCount ?? item.reviewCount ?? item._count?.reviews ?? 0,
    stock: item.stock || 0,
    badge: item.badges?.[0] || undefined,
    isHaccp: item.isHaccp !== false,
    image: (item.images?.find((img: any) => img.isMain)?.url ?? item.images?.[0]?.url ?? item.images?.[0]) ||
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    images: item.images?.length
      ? item.images.map((img: any) => (typeof img === 'string' ? img : img.url))
      : ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'],
    category: item.category?.name || item.category || 'Риба',
    categoryId: item.category?.id || item.categoryId,
    tags: item.tags?.map((t: any) => t.name || t) || [],
    origin: item.origin ?? undefined,
    weight: toNumber(item.weight),
    unit: item.unit || 'кг',
    catchMethod: item.catchMethod ?? undefined,
    storageConditions: item.storageConditions ?? undefined,
    expiryDays: toNumber(item.expiryDays),
    composition: item.composition ?? undefined,
    calories: toNumber(item.calories),
    proteins: toNumber(item.proteins),
    fats: toNumber(item.fats),
    carbs: toNumber(item.carbs),
    seoTitle: item.seoTitle ?? undefined,
    seoDescription: item.seoDescription ?? undefined,
  };
}
