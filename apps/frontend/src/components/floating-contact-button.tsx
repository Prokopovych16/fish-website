'use client';

import { useState } from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const CONTACTS = [
  {
    label: 'Email',
    href: 'mailto:valigura.fish@gmail.com',
    color: 'bg-dark hover:bg-dark-700',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/380637760707',
    color: 'bg-emerald-500 hover:bg-emerald-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    label: 'Телефон',
    href: 'tel:+380637760707',
    color: 'bg-dark hover:bg-dark-700',
    icon: <Phone className="h-5 w-5" />,
  },
];

export function FloatingContactButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 md:bottom-8">
      {/* Contact options */}
      <AnimatePresence>
        {open && (
          <div className="flex flex-col items-end gap-2.5">
            {CONTACTS.map((contact, i) => (
              <motion.a
                key={contact.label}
                href={contact.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 16, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 16, scale: 0.9 }}
                transition={{ delay: (CONTACTS.length - 1 - i) * 0.05, type: 'spring', stiffness: 400, damping: 28 }}
                whileHover={{ x: -4 }}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl px-4 text-sm font-medium text-white shadow-[0_10px_24px_rgba(22,24,28,0.2)] transition-colors duration-150 ${contact.color}`}
              >
                <span>{contact.label}</span>
                {contact.icon}
              </motion.a>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-dark text-white shadow-[0_12px_30px_rgba(22,24,28,0.3)] transition-all duration-300 hover:scale-105 hover:bg-dark-700 active:scale-95"
        aria-label="Зв'язатися з нами"
        aria-expanded={open}
      >
        {!open && <span className="absolute inset-0 animate-ping rounded-full bg-dark/30 [animation-duration:2.5s]" />}
        <motion.span
          key={String(open)}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="relative flex"
        >
          {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </motion.span>
      </button>
    </div>
  );
}
