'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, User, X, Search, Fish, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useAuthStore } from '@/lib/auth';
import { useCartStore } from '@/lib/cart';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { name: 'Каталог', href: '/catalog' },
  { name: 'Про нас', href: '/about' },
  { name: 'Блог', href: '/blog' },
  { name: 'Контакти', href: '/contact' },
];

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.summary.totalItems);
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/catalog?search=${encodeURIComponent(q)}`);
    setSearchQuery('');
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          isScrolled
            ? 'border-dark/5 bg-white/80 shadow-[0_8px_30px_rgba(13,27,42,0.06)] backdrop-blur-xl'
            : 'border-transparent bg-white'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-dark">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark text-white transition-all duration-300 group-hover:-rotate-12 group-hover:scale-105">
              <Fish size={18} />
            </span>
            Валігура
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full bg-dark-50 p-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-dark ${
                    isActive ? 'text-dark' : 'text-dark-500'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search (Desktop only) */}
            <form onSubmit={handleSearch} className="group hidden lg:flex items-center gap-2 rounded-xl border border-dark/10 bg-white px-3 py-2 transition-all duration-300 focus-within:border-dark/30 focus-within:shadow-[0_8px_24px_rgba(13,27,42,0.08)] hover:border-dark/20">
              <button type="submit" aria-label="Шукати" className="text-dark-400 hover:text-dark transition-colors">
                <Search size={15} />
              </button>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук..."
                className="w-28 bg-transparent text-sm text-dark transition-all duration-300 placeholder:text-dark-400 focus:w-48 focus:outline-none"
              />
            </form>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center">
                {isAdmin ? (
                  <Link href="/admin">
                    <Button variant="secondary" size="sm">Адмінка</Button>
                  </Link>
                ) : (
                  <Link
                    href="/account/profile"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-dark-500 transition-all duration-300 hover:bg-dark-50 hover:text-dark"
                  >
                    <User size={16} />
                    {user?.firstName || 'Профіль'}
                  </Link>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="hidden md:block">
                <Button variant="secondary" size="sm">Увійти</Button>
              </Link>
            )}

            {/* Cart Button */}
            <div className="relative">
              <Link href="/cart">
                <Button variant="primary" size="sm" aria-label="Кошик">
                  <ShoppingBag size={18} />
                </Button>
              </Link>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: [0.4, 1.3, 1], opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-400 px-1 text-[11px] font-semibold text-white ring-2 ring-white"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label="Меню"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-dark/10 text-dark transition-all duration-300 hover:bg-dark-50 active:scale-95 lg:hidden"
            >
              <motion.span key={String(isMobileMenuOpen)} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }} className="flex">
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </motion.span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[100] bg-dark/30 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
            <motion.div
              className="fixed right-0 top-0 z-[101] h-screen w-80 max-w-[85vw] overflow-y-auto rounded-l-3xl bg-white shadow-2xl lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-dark/10 p-6">
                  <span className="text-base font-semibold text-dark">Меню</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Закрити меню" className="flex h-11 w-11 items-center justify-center rounded-xl text-dark-500 transition-colors hover:bg-dark-50 hover:text-dark">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex-1 space-y-1 px-4 py-6">
                  {NAV_ITEMS.map((item, i) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium transition-all duration-300 hover:bg-dark-50 hover:text-dark ${
                          isActive ? 'bg-dark-50 text-dark' : 'text-dark-600'
                        }`}
                      >
                        {item.name}
                        <ArrowRight size={16} className="text-dark-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-dark" />
                      </Link>
                    </motion.div>
                  );
                  })}
                </nav>

                {isAuthenticated ? (
                  <div className="space-y-1 border-t border-dark/10 p-4">
                    <Link
                      href={isAdmin ? '/admin' : '/account/profile'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-lg px-4 py-3 text-sm font-medium text-dark transition-colors hover:bg-dark/5"
                    >
                      {isAdmin ? 'Адмінка' : (user?.firstName || 'Профіль')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Вийти
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-dark/10 p-4">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-xl bg-dark px-4 py-3.5 text-center text-sm font-semibold text-white transition-all duration-300 hover:bg-dark-700 active:scale-[0.98]"
                    >
                      Увійти
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
