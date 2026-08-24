import type { MetadataRoute } from 'next';
import { getProducts, getCategories } from '../lib/products';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/catalog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/reviews`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  const [products, categories, blogData] = await Promise.all([
    getProducts({ limit: 500 }).catch(() => []),
    getCategories().catch(() => []),
    fetch(`${apiUrl}/blog?status=PUBLISHED&limit=500`, { next: { revalidate: 3600 } })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(d => d.data ?? [])
      .catch(() => []),
  ]);

  const productPages: MetadataRoute.Sitemap = products.map(p => ({
    url: `${siteUrl}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map(c => ({
    url: `${siteUrl}/catalog?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = blogData.map((post: any) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages];
}
