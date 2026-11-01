'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth';
import { PasswordStrength } from '@/components/shared/interactive';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError('Невалідний токен');
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Помилка скидання пароля');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-sage-100/70 blur-3xl" />
        <div className="relative w-full max-w-md">
          {/* Success Message */}
          <div className="rounded-3xl border border-dark/10 bg-white/90 p-6 shadow-[0_30px_90px_rgba(13,27,42,0.08)] backdrop-blur sm:p-8 text-center">
            <div className="w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-sage-600" />
            </div>
            <h1 className="text-2xl font-semibold text-dark mb-4">Пароль змінено</h1>
            <p className="text-dark-500 mb-6">
              Ваш пароль успішно змінено. Тепер ви можете увійти з новим паролем.
            </p>
            <p className="text-sm text-dark-400">
              Перенаправлення на сторінку входу...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-sage-100/70 blur-3xl" />
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-lg font-semibold tracking-tight text-dark">Валігура</span>
          <h1 className="mt-6 text-3xl font-semibold text-dark">Новий пароль</h1>
          <p className="mt-2 text-dark-500">Введіть новий пароль для вашого акаунту</p>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-dark/10 bg-white/90 p-6 shadow-[0_30px_90px_rgba(13,27,42,0.08)] backdrop-blur sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-600 mb-2">
                Новий пароль *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full pl-12 pr-12 py-3 rounded-xl border border-dark/5 bg-dark-50 text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none"
                  placeholder="Мінімум 8 символів"
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
              {password ? (
                <PasswordStrength password={password} />
              ) : (
                <p className="mt-1 text-xs text-dark-400">
                  Мінімум 8 символів, велика літера та цифра
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-600 mb-2">
                Підтвердіть пароль *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="peer w-full pl-12 pr-12 py-3 rounded-xl border border-dark/5 bg-dark-50 text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none"
                  placeholder="Повторіть пароль"
                  required
                />
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-400 transition-colors duration-300 peer-focus:text-dark" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-dark-400 transition-all hover:bg-white hover:text-dark"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Збереження...' : 'Змінити пароль'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-dark/15 border-t-dark"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}