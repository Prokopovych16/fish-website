import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Calendar, User, Tag, ArrowLeft, BookOpen } from 'lucide-react'
import { BreadcrumbJsonLd } from '../../../components/json-ld'
import type { Metadata } from 'next'

export const revalidate = 60

interface BlogPostPageProps {
  params: { slug: string }
}

async function getPost(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
  try {
    const res = await fetch(`${apiUrl}/blog/slug/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getRelatedPosts(limit = 3) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
  try {
    const res = await fetch(`${apiUrl}/blog?status=PUBLISHED&limit=${limit}`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.data ?? []
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Публікацію не знайдено' }

  const description = post.seoDescription ?? post.excerpt ?? ''

  return {
    title: post.seoTitle ?? `${post.title} | Валігура`,
    description,
    openGraph: {
      title: post.title,
      description,
      images: post.image ? [{ url: post.image }] : [],
      type: 'article',
      publishedTime: post.publishedAt ?? post.createdAt,
      authors: [post.authorName],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, related] = await Promise.all([getPost(params.slug), getRelatedPosts(3)])

  if (!post || post.status !== 'PUBLISHED') notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const publishDate = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date(post.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Головна', url: siteUrl },
          { name: 'Блог', url: `${siteUrl}/blog` },
          { name: post.title, url: `${siteUrl}/blog/${post.slug}` },
        ]}
      />

      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            image: post.image,
            author: { '@type': 'Person', name: post.authorName },
            publisher: { '@type': 'Organization', name: 'Валігура' },
            datePublished: post.publishedAt ?? post.createdAt,
            dateModified: post.updatedAt,
          }),
        }}
      />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-dark-400">
          <Link href="/" className="hover:text-dark transition-colors">Головна</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-dark transition-colors">Блог</Link>
          <span>/</span>
          <span className="text-dark-600 line-clamp-1">{post.title}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <article>
            {/* Hero image */}
            {post.image && (
              <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl bg-dark-50">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-dark-50 px-3 py-1 text-xs font-medium text-dark-600"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl font-bold text-dark md:text-4xl">{post.title}</h1>

            {post.excerpt && (
              <p className="mt-4 text-lg text-dark-400 leading-relaxed">{post.excerpt}</p>
            )}

            {/* Meta */}
            <div className="mt-5 flex flex-wrap items-center gap-4 border-b border-dark/10 pb-6 text-sm text-dark-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {publishDate}
              </span>
              {post.authorName && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.authorName}
                </span>
              )}
            </div>

            {/* Article body */}
            <div
              className="mt-8 max-w-none text-dark-600 leading-relaxed [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-dark [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-dark [&_h2]:mt-7 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-dark [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-5 [&_p]:leading-relaxed [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1.5 [&_a]:text-dark [&_a]:underline hover:[&_a]:text-dark-600 [&_strong]:font-semibold [&_strong]:text-dark [&_img]:rounded-lg [&_img]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-dark/20 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-dark-500 [&_blockquote]:my-6 [&_pre]:rounded-lg [&_pre]:bg-dark [&_pre]:text-dark-100 [&_pre]:p-5 [&_pre]:my-5 [&_pre]:overflow-x-auto [&_code]:bg-dark-50 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Back link */}
            <div className="mt-12 border-t border-dark/10 pt-8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg border border-dark/10 px-6 py-3 text-sm font-medium text-dark-500 transition hover:border-dark/30 hover:text-dark"
              >
                <ArrowLeft className="h-4 w-4" />
                Повернутись до блогу
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Related posts */}
            {related.filter((r: any) => r.slug !== post.slug).length > 0 && (
              <div className="rounded-3xl border border-dark/10 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-dark">Інші публікації</h3>
                <div className="space-y-4">
                  {related
                    .filter((r: any) => r.slug !== post.slug)
                    .slice(0, 4)
                    .map((r: any) => (
                      <Link
                        key={r.id}
                        href={`/blog/${r.slug}`}
                        className="group flex gap-3 rounded-lg hover:bg-dark-50 p-2 -mx-2 transition"
                      >
                        {r.image ? (
                          <img src={r.image} alt={r.title} className="h-14 w-14 flex-shrink-0 rounded-xl object-cover bg-dark-50" />
                        ) : (
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-dark-50">
                            <BookOpen className="h-6 w-6 text-dark-200" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-dark line-clamp-2 transition-colors">{r.title}</p>
                          <p className="mt-1 text-xs text-dark-400">
                            {new Date(r.publishedAt ?? r.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="relative overflow-hidden rounded-3xl bg-dark p-6 text-white">
              <h3 className="text-lg font-semibold">Спробуйте наші товари!</h3>
              <p className="mt-2 text-sm text-white/70">Свіжа риба та морепродукти з HACCP-сертифікованого виробництва.</p>
              <Link
                href="/catalog"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-dark transition hover:bg-white/90"
              >
                До каталогу
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}
