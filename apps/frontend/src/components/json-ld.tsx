interface ProductJsonLdProps {
  product: {
    name: string;
    description?: string | null;
    image?: string | null;
    price: number;
    oldPrice?: number | null;
    sku?: string | null;
    stock: number;
    rating?: number | null;
    reviewsCount?: number;
    slug: string;
  };
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.image ? [product.image] : undefined,
    sku: product.sku ?? undefined,
    url: `${siteUrl}/product/${product.slug}`,
    brand: {
      '@type': 'Brand',
      name: 'Валігура',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'UAH',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Валігура',
      },
      ...(product.oldPrice ? { priceValidUntil: new Date(Date.now() + 30 * 86400 * 1000).toISOString().slice(0, 10) } : {}),
    },
    ...(product.rating && product.reviewsCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.reviewsCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Валігура',
    url: siteUrl,
    logo: `${siteUrl}/icons/icon-512.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      areaServed: 'UA',
      availableLanguage: 'Ukrainian',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Хмільник',
      addressRegion: 'Вінницька область',
      addressCountry: 'UA',
    },
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
