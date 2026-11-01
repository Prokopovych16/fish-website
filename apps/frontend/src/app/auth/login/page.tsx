'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Send, Fish } from 'lucide-react';
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-sage-100/70 blur-3xl" />
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="group inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-dark">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark text-white transition-transform duration-300 group-hover:-rotate-12"><Fish size={18} /></span>
            Валігура
          </Link>
          <h1 className="mt-6 text-3xl font-semibold text-dark">Вхід в акаунт</h1>
          <p className="mt-2 text-dark-500">Введіть ваші дані для входу</p>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-dark/10 bg-white/90 p-6 shadow-[0_30px_90px_rgba(13,27,42,0.08)] backdrop-blur sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
                  className="peer w-full pl-12 pr-4 py-3 rounded-xl border border-dark/5 bg-dark-50 text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none"
                  placeholder="your@email.com"
                  required
                />
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-400 transition-colors duration-300 peer-focus:text-dark" />
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
                  className="peer w-full pl-12 pr-12 py-3 rounded-xl border border-dark/5 bg-dark-50 text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none"
                  placeholder="Введіть пароль"
                  required
                />
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-400 transition-colors duration-300 peer-focus:text-dark" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-dark-400 transition-all hover:bg-white hover:text-dark"
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
