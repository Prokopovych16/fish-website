'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, MessageCircle, Plus, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fieldClass } from '@/lib/ui-classes';

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
  const [query, setQuery] = useState('');

  const categories = ['all', ...Array.from(new Set(faqs.map(f => f.category).filter(Boolean) as string[]))];
  const q = query.trim().toLowerCase();
  const visible = (activeCategory === 'all' ? faqs : faqs.filter(f => f.category === activeCategory))
    .filter(f => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));

  return (
    <>
      {/* Category tabs */}
      {/* Миттєвий пошук по питаннях */}
      <div className="group relative mx-auto mb-6 max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400 transition-colors group-focus-within:text-dark" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpenId(null); }}
          placeholder="Пошук по питаннях..."
          className={`${fieldClass} py-3.5 pl-11 pr-4`}
        />
      </div>

      {categories.length > 1 && (
        <div className="mb-8 flex justify-center">
          <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-dark-50 p-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenId(null); }}
                className={`relative min-h-[40px] whitespace-nowrap rounded-xl px-4 text-sm font-medium transition-colors duration-200 ${
                  activeCategory === cat ? 'text-white' : 'text-dark-500 hover:text-dark'
                }`}
              >
                {activeCategory === cat && (
                  <motion.span
                    layoutId="faq-category-pill"
                    className="absolute inset-0 rounded-xl bg-dark shadow-[0_8px_20px_rgba(22,24,28,0.18)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="relative">{cat === 'all' ? 'Всі питання' : (CATEGORY_LABELS[cat] ?? cat)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dark/10 bg-white p-16 text-center">
          <HelpCircle className="mx-auto mb-4 h-16 w-16 text-dark-200" />
          <p className="text-dark-500">Питань не знайдено</p>
        </div>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence initial={false}>
          {visible.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.2) }}
            >
              <FaqAccordionItem
                item={item}
                index={i}
                isOpen={openId === item.id}
                onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              />
            </motion.div>
          ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Support CTA */}
      <div className="mt-16 relative overflow-hidden rounded-3xl bg-dark p-8 text-center text-white">
        <MessageCircle className="mx-auto mb-3 h-10 w-10 text-white/70" />
        <h2 className="text-xl font-semibold">Не знайшли відповіді?</h2>
        <p className="mt-2 text-white/70">
          Зв'яжіться з нами — ми відповімо на будь-яке запитання
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-dark transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(255,255,255,0.2)] active:scale-[0.98]"
        >
          Написати нам
        </Link>
      </div>
    </>
  );
}

function FaqAccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`group overflow-hidden rounded-2xl border transition-all duration-300 ${
      isOpen
        ? 'border-dark/10 bg-white shadow-[0_12px_30px_rgba(13,27,42,0.08)]'
        : 'border-dark/5 bg-dark-50 hover:border-dark/10 hover:bg-white'
    }`}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 p-5 text-left sm:px-6"
      >
        <span className="flex items-start gap-4">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold tabular-nums transition-all duration-300 ${
            isOpen ? 'bg-primary text-white' : 'bg-white text-dark-500 shadow-sm group-hover:text-dark'
          }`}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="pt-1.5 text-base font-medium text-dark">{item.question}</span>
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
            isOpen ? 'bg-dark text-white' : 'bg-white text-dark-500 shadow-sm'
          }`}
        >
          <Plus className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-6 text-sm leading-relaxed text-dark-500 sm:pl-[4.75rem] sm:pr-6 [&_a]:text-dark [&_a]:underline [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-dark"
              dangerouslySetInnerHTML={{ __html: item.answer }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
