import type { Metadata } from 'next';
import { HelpCircle } from 'lucide-react';
import { FaqClient } from './faq-client';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Часті запитання (FAQ)',
  description: 'Відповіді на найпоширеніші запитання про доставку, оплату, товари та повернення у Валігура — виробника натуральної риби.',
};

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder: number;
}

async function getFaqs(): Promise<FaqItem[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${apiUrl}/faq?limit=100&isActive=true`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data ?? []);
  } catch {
    return [];
  }
}

export default async function FaqPage() {
  const faqs = await getFaqs();

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer.replace(/<[^>]+>/g, ''),
      },
    })),
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-dark-50">
          <HelpCircle className="h-7 w-7 text-dark-500" />
        </div>
        <h1 className="text-3xl font-semibold text-dark sm:text-4xl">Часті запитання</h1>
        <p className="mt-3 text-base text-dark-500">
          Відповіді на найпоширеніші запитання про нашу продукцію та сервіс
        </p>
      </div>

      <FaqClient faqs={faqs} />
    </main>
  );
}
