'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, Fish } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth';
import { PasswordStrength } from '@/components/shared/interactive';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);

  const { register } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Паролі не співпадають');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        password: formData.password,
      });
      setRegistered(true);
    } catch (error: any) {
      const msg = error.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Помилка реєстрації');
    } finally {
      setIsLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-sage-100/70 blur-3xl" />
        <div className="relative w-full max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sage-50">
            <CheckCircle className="h-10 w-10 text-sage-600" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-dark">Акаунт створено!</h1>
          <p className="mt-3 text-dark-500">
            Ми надіслали листа з посиланням для підтвердження на{' '}
            <strong>{formData.email}</strong>.
          </p>
          <p className="mt-2 text-sm text-dark-400">
            Перейдіть за посиланням у листі, щоб активувати акаунт.
            Перевірте папку «Спам», якщо листа немає у вхідних.
          </p>
          <Link
            href="/auth/login"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-dark px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-dark-700"
          >
            Перейти до входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="group inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-dark">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark text-white transition-transform duration-300 group-hover:-rotate-12"><Fish size={18} /></span>
            Валігура
          </Link>
          <h1 className="mt-6 text-3xl font-semibold text-dark">Створити акаунт</h1>
          <p className="mt-2 text-dark-500">Приєднуйтесь до нашої спільноти</p>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-dark/10 bg-white/90 p-6 shadow-[0_30px_90px_rgba(13,27,42,0.08)] backdrop-blur sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-600 mb-2">
                Email *
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="peer w-full pl-12 pr-4 py-3 rounded-xl border border-dark/5 bg-dark-50 text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none"
                  placeholder="your@email.com"
                  required
                />
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-400 transition-colors duration-300 peer-focus:text-dark" />
              </div>
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-dark-600 mb-2">
                Ім'я *
              </label>
              <div className="relative">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="peer w-full pl-12 pr-4 py-3 rounded-xl border border-dark/5 bg-dark-50 text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none"
                  placeholder="Введіть ім'я"
                  required
                />
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-400 transition-colors duration-300 peer-focus:text-dark" />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-dark-600 mb-2">
                Прізвище
              </label>
              <div className="relative">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="peer w-full pl-12 pr-4 py-3 rounded-xl border border-dark/5 bg-dark-50 text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none"
                  placeholder="Введіть прізвище"
                />
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-400 transition-colors duration-300 peer-focus:text-dark" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-600 mb-2">
                Пароль *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
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
              {formData.password ? (
                <PasswordStrength password={formData.password} />
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
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
              {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-dark-500">
              Вже маєте акаунт?{' '}
              <Link href="/auth/login" className="text-dark font-medium transition-colors hover:text-dark-600">
                Увійти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}