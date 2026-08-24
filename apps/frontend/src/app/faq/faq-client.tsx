'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  'Доставка': 'Доставка',
  'Оплата': 'Оплата',
  'Товари': 'Товари',
  'Повернення': 'Повернення',
  'Загальне': 'Загальне',
};

export function FaqClient({ faqs }: { faqs: FaqItem[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(faqs.map(f => f.category).filter(Boolean) as string[]))];
  const visible = activeCategory === 'all' ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <>
      {/* Category tabs */}
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenId(null); }}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-dark text-white'
                  : 'bg-white text-dark-500 border border-dark/10 hover:border-dark/30 hover:text-dark'
              }`}
            >
              {cat === 'all' ? 'Всі питання' : (CATEGORY_LABELS[cat] ?? cat)}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <div className="rounded-xl border border-dark/10 bg-white p-16 text-center">
          <HelpCircle className="mx-auto mb-4 h-16 w-16 text-dark-200" />
          <p className="text-dark-500">Питань не знайдено</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(item => (
            <FaqAccordionItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
            />
          ))}
        </div>
      )}

      {/* Support CTA */}
      <div className="mt-16 rounded-xl bg-dark p-8 text-center text-white">
        <MessageCircle className="mx-auto mb-3 h-10 w-10 text-white/70" />
        <h2 className="text-xl font-semibold">Не знайшли відповіді?</h2>
        <p className="mt-2 text-white/70">
          Зв'яжіться з нами — ми відповімо на будь-яке запитання
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-dark transition hover:bg-white/90"
        >
          Написати нам
        </Link>
      </div>
    </>
  );
}

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`overflow-hidden rounded-xl border bg-white transition-colors duration-200 ${isOpen ? 'border-dark/20' : 'border-dark/10'}`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-7 py-5 text-left"
      >
        <span className="text-base font-medium text-dark">
          {item.question}
        </span>
        <ChevronDown
          className={`ml-4 h-5 w-5 flex-shrink-0 text-dark-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-dark/10 px-7 py-5">
          <div
            className="text-sm text-dark-500 leading-relaxed [&_a]:text-dark [&_a]:underline [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-dark"
            dangerouslySetInnerHTML={{ __html: item.answer }}
          />
        </div>
      )}
    </div>
  );
}
