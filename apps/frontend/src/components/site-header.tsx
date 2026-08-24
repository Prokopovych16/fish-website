'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, User, X, Search } from 'lucide-react';
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
        className={`sticky top-0 z-50 border-b bg-white transition-shadow duration-200 ${
          isScrolled ? 'border-dark/10 shadow-sm' : 'border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight text-dark">
            Валігура
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-sm font-medium transition-colors hover:text-dark ${
                    isActive ? 'text-dark' : 'text-dark-500'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-dark" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search (Desktop only) */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2 rounded-lg border border-dark/10 px-3 py-2 focus-within:border-dark/30 transition-colors">
              <button type="submit" aria-label="Шукати" className="text-dark-400 hover:text-dark transition-colors">
                <Search size={15} />
              </button>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук..."
                className="w-32 bg-transparent text-sm text-dark placeholder:text-dark-400 focus:outline-none"
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
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-dark-500 transition-colors hover:bg-dark/5 hover:text-dark"
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-dark text-[11px] font-semibold text-white ring-2 ring-white"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-dark/10 text-dark lg:hidden"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[100] bg-dark/30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
            <motion.div
              className="fixed right-0 top-0 z-[101] h-screen w-80 max-w-xs overflow-y-auto bg-white shadow-xl lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-dark/10 p-6">
                  <span className="text-base font-semibold text-dark">Меню</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-dark-500 hover:text-dark">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex-1 space-y-1 px-4 py-6">
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-dark/5 hover:text-dark ${
                        isActive ? 'bg-dark/5 text-dark' : 'text-dark-600'
                      }`}
                    >
                      {item.name}
                    </Link>
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
                      className="block rounded-lg bg-dark px-4 py-3 text-center text-sm font-medium text-white"
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
