'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, CreditCard, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Профіль', href: '/account/profile', icon: User },
  { name: 'Замовлення', href: '/account/orders', icon: Package },
  { name: 'Список бажань', href: '/account/wishlist', icon: Heart },
  { name: 'Бонуси', href: '/account/loyalty', icon: CreditCard },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, _hasHydrated, logout, refreshUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Чекаємо поки Zustand відновить стан з localStorage
    if (!_hasHydrated) return;

    if (!isAuthenticated && !user) {
      router.push('/auth/login');
      return;
    }

    // Стан з кешу вже є — звіряємо токен у фоні, не блокуючи UI
    refreshUser().catch(() => {
      router.push('/auth/login');
    });
  }, [_hasHydrated]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Блокуючий лоадер до завершення гідрації або якщо немає кешованих даних
  if (!_hasHydrated || !user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-dark/15 border-t-dark"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-dark/10 bg-white p-6 shadow-[0_18px_40px_rgba(13,27,42,0.05)]">
              {/* User Info */}
              <div className="text-center mb-8">
                <div className="relative mx-auto mb-4 h-20 w-20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400 to-primary blur-md opacity-40" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary text-2xl font-semibold text-white">
                    {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                  </div>
                </div>
                <h2 className="font-semibold text-dark">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-dark-500">{user.email}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600">
                  <CreditCard className="h-4 w-4" />
                  {user.loyaltyPoints} балів
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group relative flex min-h-[48px] items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors duration-200 ${
                        active ? 'text-white' : 'text-dark-600 hover:bg-dark-50 hover:text-dark'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="account-nav-pill"
                          className="absolute inset-0 rounded-xl bg-dark shadow-[0_8px_20px_rgba(22,24,28,0.18)]"
                          transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                        />
                      )}
                      <Icon className={`relative h-5 w-5 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`} />
                      <span className="relative">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="mt-8 pt-6 border-t border-dark/10">
                <button
                  onClick={handleLogout}
                  className="group flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  Вийти
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}