'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const { login } = useAuthStore();
  const router = useRouter();

  const needsVerification = error.toLowerCase().includes('підтвердіть');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResendState('idle');

    try {
      const user = await login(email, password);
      if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Помилка входу');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendState !== 'idle') return;
    setResendState('sending');
    try {
      await api.post('/auth/resend-verification', { email });
      setResendState('sent');
    } catch {
      setResendState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-dark">
            Валігура
          </Link>
          <h1 className="mt-6 text-3xl font-semibold text-dark">Вхід в акаунт</h1>
          <p className="mt-2 text-dark-500">Введіть ваші дані для входу</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-dark/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p>{error}</p>
                {needsVerification && (
                  <div className="mt-3 border-t border-red-200 pt-3">
                    {resendState === 'sent' ? (
                      <p className="text-red-700 font-medium">
                        ✓ Лист відправлено на {email}. Перевірте пошту.
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendState === 'sending' || !email}
                        className="flex items-center gap-1.5 font-medium underline hover:text-red-800 disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {resendState === 'sending' ? 'Надсилаємо...' : 'Надіслати лист підтвердження знову'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-600 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-dark/10 rounded-lg focus:border-dark/30 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 h-5 w-5" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-600 mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-dark/10 rounded-lg focus:border-dark/30 focus:outline-none transition-colors"
                  placeholder="Введіть пароль"
                  required
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 h-5 w-5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-dark-500 hover:text-dark transition-colors"
              >
                Забули пароль?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Вхід...' : 'Увійти'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-dark-500">
              Немає акаунту?{' '}
              <Link href="/auth/register" className="text-dark font-medium transition-colors hover:text-dark-600">
                Зареєструватися
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
