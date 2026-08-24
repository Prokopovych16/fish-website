'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Package, ShoppingBag, Users, Settings, Activity, MessageCircle, Tag, BookOpen, BarChart3, LogOut, Menu, X, ChevronDown, Bell, Star } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin/dashboard', label: 'Панель керування', icon: Activity },
  { href: '/admin/analytics', label: 'Аналітика', icon: BarChart3 },
  {
    href: '/admin/products',
    label: 'Товари',
    icon: ShoppingBag,
    submenu: [
      { href: '/admin/products', label: 'Всі товари' },
      { href: '/admin/categories', label: 'Категорії' },
    ],
  },
  { href: '/admin/orders', label: 'Замовлення', icon: Package },
  { href: '/admin/customers', label: 'Клієнти', icon: Users },
  { href: '/admin/reviews', label: 'Відгуки', icon: MessageCircle },
  { href: '/admin/loyalty', label: 'Бонуси', icon: Star },
  {
    href: '/admin/discounts',
    label: 'Маркетинг',
    icon: Tag,
    submenu: [
      { href: '/admin/discounts', label: 'Знижки' },
      { href: '/admin/flash-sales', label: 'Флеш-розпродажі' },
      { href: '/admin/banners', label: 'Банери' },
    ],
  },
  {
    href: '/admin/blog',
    label: 'Контент',
    icon: BookOpen,
    submenu: [
      { href: '/admin/blog', label: 'Блог' },
      { href: '/admin/faq', label: 'FAQ' },
    ],
  },
  { href: '/admin/notifications', label: 'Нотифікації', icon: Bell },
  { href: '/admin/settings', label: 'Налаштування', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, refreshUser, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  useEffect(() => {
    // Дані юзера вже є локально (persisted) — рендеримо одразу, а звіряємо
    // токен/роль у фоні, без блокування інтерфейсу мережевим запитом.
    refreshUser().catch(() => router.push('/auth/login'));
  }, []);

  useEffect(() => {
    if (user && !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      router.push('/');
    }
  }, [user, router]);

  // Блокуючий лоадер показуємо лише якщо взагалі немає закешованих даних користувача
  // (перший вхід без локального стейту) — інакше рендеримо сторінку миттєво
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-primary mx-auto"></div>
          <p className="text-slate-600 font-medium">Завантаження панелі керування...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg text-slate-700 hover:bg-slate-100 transition"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Адмін-панель</p>
              <p className="text-sm font-semibold text-slate-700">Валігура</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-100">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                {user.firstName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-700">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-500">{user.role === 'SUPER_ADMIN' ? 'Супер адмін' : user.role === 'MANAGER' ? 'Менеджер' : 'Адміністратор'}</p>
              </div>
            </div>

            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm font-medium">Вийти</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="flex">
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Затемнений оверлей на мобільних — клік закриває меню */}
              <motion.div
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
              />

              {/* Sidebar — z-50 щоб бути вище за всі інші елементи */}
              <motion.aside
                className="fixed lg:relative top-0 lg:top-auto left-0 z-50 w-64 h-screen lg:h-[calc(100vh-64px)] bg-white border-r border-slate-200/50 overflow-y-auto scrollbar-hide lg:scrollbar-thin pt-[64px] lg:pt-0"
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
              >
                <nav className="p-6 space-y-2">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const hasSubmenu = !!item.submenu;
                    const isSubmenuExpanded = expandedMenu === item.href;

                    return (
                      <div key={item.href}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {hasSubmenu ? (
                            <button
                              onClick={() => setExpandedMenu(isSubmenuExpanded ? null : item.href)}
                              className={`w-full flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                isActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-slate-700 hover:bg-slate-50 hover:text-primary'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5" />
                                {item.label}
                              </div>
                              <motion.div
                                animate={{ rotate: isSubmenuExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown size={16} />
                              </motion.div>
                            </button>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={closeSidebarOnMobile}
                              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                isActive
                                  ? 'bg-primary/10 text-primary shadow-md'
                                  : 'text-slate-700 hover:bg-slate-50 hover:text-primary'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                              {item.label}
                            </Link>
                          )}
                        </motion.div>

                        {/* Submenu */}
                        <AnimatePresence>
                          {hasSubmenu && isSubmenuExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-1 mt-1 ml-4"
                            >
                              {item.submenu?.map((subitem) => (
                                <Link
                                  key={subitem.href}
                                  href={subitem.href}
                                  onClick={closeSidebarOnMobile}
                                  className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition border-l-2 ${
                                    pathname === subitem.href
                                      ? 'bg-primary/5 text-primary border-primary'
                                      : 'text-slate-600 hover:text-primary border-transparent hover:border-primary'
                                  }`}
                                >
                                  {subitem.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.main
          className="flex-1 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}