'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Fish } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { forgotPassword } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Помилка відправки email');
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
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="group inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-dark">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark text-white transition-transform duration-300 group-hover:-rotate-12"><Fish size={18} /></span>
            Валігура
          </Link>
          </div>

          {/* Success Message */}
          <div className="rounded-3xl border border-dark/10 bg-white/90 p-6 shadow-[0_30px_90px_rgba(13,27,42,0.08)] backdrop-blur sm:p-8 text-center">
            <div className="w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-sage-600" />
            </div>
            <h1 className="text-2xl font-semibold text-dark mb-4">Перевірте вашу пошту</h1>
            <p className="text-dark-500 mb-6">
              Ми відправили інструкції для скидання пароля на адресу <strong>{email}</strong>
            </p>
            <Link href="/auth/login">
              <Button className="px-6 py-3">
                Повернутися до входу
              </Button>
            </Link>
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
          <Link href="/" className="group inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-dark">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark text-white transition-transform duration-300 group-hover:-rotate-12"><Fish size={18} /></span>
            Валігура
          </Link>
          <h1 className="mt-6 text-3xl font-semibold text-dark">Скидання пароля</h1>
          <p className="mt-2 text-dark-500">Введіть ваш email для отримання інструкцій</p>
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

            {/* Submit */}
            <Button
              type="submit"
              className="w-full py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Відправка...' : 'Відправити інструкції'}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link href="/auth/login" className="inline-flex items-center gap-2 text-dark-500 hover:text-dark font-medium transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Повернутися до входу
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}