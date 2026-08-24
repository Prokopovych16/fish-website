'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
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
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="text-lg font-semibold tracking-tight text-dark">
              Валігура
            </Link>
          </div>

          {/* Success Message */}
          <div className="bg-white rounded-xl border border-dark/10 p-8 text-center">
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
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-dark">
            Валігура
          </Link>
          <h1 className="mt-6 text-3xl font-semibold text-dark">Скидання пароля</h1>
          <p className="mt-2 text-dark-500">Введіть ваш email для отримання інструкцій</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-dark/10 p-8">
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
                  className="w-full pl-12 pr-4 py-3 border border-dark/10 rounded-lg focus:border-dark/30 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 h-5 w-5" />
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