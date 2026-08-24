'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, CreditCard, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

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
            <div className="bg-white rounded-xl border border-dark/10 p-6 sticky top-8">
              {/* User Info */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-dark-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-dark-500" />
                </div>
                <h2 className="font-semibold text-dark">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-dark-500">{user.email}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-dark-50 rounded-full text-sm text-dark-600 font-medium">
                  <CreditCard className="h-4 w-4" />
                  {user.loyaltyPoints} балів
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                        pathname === item.href
                          ? 'bg-dark text-white'
                          : 'text-dark-600 hover:bg-dark/5'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="mt-8 pt-6 border-t border-dark/10">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
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