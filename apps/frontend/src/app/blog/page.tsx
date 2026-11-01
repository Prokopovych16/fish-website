import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Tag, ArrowRight, BookOpen } from 'lucide-react'
import type { Metadata } from 'next'
import { Reveal } from '../../components/shared/interactive'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Блог та рецепти | Валігура',
  description: 'Рецепти страв з копченої, пряної та мороженої риби. Поради щодо вибору та приготування натуральної риби.',
  openGraph: {
    title: 'Блог та рецепти | Валігура',
    description: 'Рецепти та поради щодо приготування натуральної риби від Валігура.',
    type: 'website',
  },
}

async function getBlogPosts(page = 1) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
  try {
    const res = await fetch(
      `${apiUrl}/blog?status=PUBLISHED&page=${page}&limit=12`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return { data: [], pagination: { total: 0, pages: 1, page: 1, limit: 12 } }
    return res.json()
  } catch {
    return { data: [], pagination: { total: 0, pages: 1, page: 1, limit: 12 } }
  }
}

interface PageProps {
  searchParams: { page?: string }
}

export default async function BlogPage({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page ?? 1)
  const { data: posts, pagination } = await getBlogPosts(currentPage)

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-dark-50">
          <BookOpen className="h-6 w-6 text-dark-500" />
        </div>
        <h1 className="text-3xl font-semibold text-dark sm:text-4xl">Блог та рецепти</h1>
        <p className="mt-3 text-base text-dark-500">
          Рецепти страв, поради щодо вибору та зберігання рибної продукції
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-dark/10 bg-white p-16 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-dark-200" />
          <h2 className="text-lg font-semibold text-dark">Публікацій поки немає</h2>
          <p className="mt-2 text-dark-500">Незабаром тут з'являться цікаві матеріали.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any, i: number) => (
              <Reveal key={post.id} index={i % 3} className="h-full">
                <BlogCard post={post} />
              </Reveal>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={`/blog?page=${p}`}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage
                      ? 'bg-dark text-white'
                      : 'border border-dark/10 bg-white text-dark-500 hover:bg-dark/5'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}

function BlogCard({ post }: { post: any }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-dark/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-dark/15 hover:shadow-[0_18px_40px_rgba(13,27,42,0.10)]"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-dark-50">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-dark-200" />
          </div>
        )}
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-dark shadow-sm backdrop-blur"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2 text-xs text-dark-400">
          <Calendar className="h-3.5 w-3.5" />
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })
            : new Date(post.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}
          {post.authorName && (
            <>
              <span>·</span>
              <span>{post.authorName}</span>
            </>
          )}
        </div>

        <h2 className="mb-2 text-base font-semibold text-dark line-clamp-2 transition-colors group-hover:text-primary">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-sm text-dark-500 line-clamp-3 flex-1">{post.excerpt}</p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-dark/5 pt-4 text-sm font-medium text-dark">
          Читати далі
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-dark-50 transition-all duration-300 group-hover:bg-dark group-hover:text-white">
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
