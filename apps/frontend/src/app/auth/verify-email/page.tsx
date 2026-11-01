'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Mail, Send } from 'lucide-react';
import api from '@/lib/api';

type State = 'loading' | 'success' | 'error' | 'no-token';

function ResendForm({ initialEmail = '' }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');

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

  if (resendState === 'sent') {
    return (
      <p className="mt-4 text-sm text-dark-500">
        ✓ Лист відправлено на <strong>{email}</strong>. Перевірте пошту.
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <p className="text-sm text-dark-400">Надіслати новий лист підтвердження:</p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ваш email"
          className="flex-1 rounded-lg border border-dark/10 px-4 py-2.5 text-sm focus:border-dark/30 focus:outline-none"
        />
        <button
          onClick={handleResend}
          disabled={!email || resendState === 'sending'}
          className="flex items-center gap-2 rounded-lg bg-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-dark-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {resendState === 'sending' ? '...' : 'Надіслати'}
        </button>
      </div>
    </div>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<State>(token ? 'loading' : 'no-token');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) return;

    api.post('/auth/verify-email', { token })
      .then(() => setState('success'))
      .catch((e: any) => {
        const msg = e?.response?.data?.message;
        setErrorMsg(Array.isArray(msg) ? msg[0] : msg || 'Невалідний або прострочений токен');
        setState('error');
      });
  }, [token]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-dark-400" />
          <p className="mt-4 text-dark-500">Підтверджуємо ваш email...</p>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="relative w-full max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sage-50">
            <CheckCircle className="h-10 w-10 text-sage-600" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-dark">Email підтверджено!</h1>
          <p className="mt-3 text-dark-500">
            Ваша електронна адреса успішно підтверджена. Тепер ви можете увійти в свій акаунт.
          </p>
          <Link
            href="/auth/login"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-dark px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-dark-700"
          >
            Увійти в акаунт
          </Link>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    const alreadyVerified = errorMsg.toLowerCase().includes('вже підтверджений');
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="relative w-full max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-dark">Помилка підтвердження</h1>
          <p className="mt-3 text-dark-500">{errorMsg}</p>
          {alreadyVerified ? (
            <Link
              href="/auth/login"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-dark px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-dark-700"
            >
              Увійти в акаунт
            </Link>
          ) : (
            <>
              <p className="mt-2 text-sm text-dark-400">
                Посилання могло протерміновати або вже було використано.
              </p>
              <div className="mt-6 rounded-xl border border-dark/10 bg-white p-6 text-left">
                <ResendForm />
              </div>
              <div className="mt-4">
                <Link
                  href="/auth/login"
                  className="text-sm text-dark-500 hover:text-dark transition-colors"
                >
                  ← Повернутися до входу
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // no-token state: user navigated here without a token (just registered)
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="relative w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-dark-50">
          <Mail className="h-10 w-10 text-dark-500" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-dark">Перевірте вашу пошту</h1>
        <p className="mt-3 text-dark-500">
          Ми надіслали лист із посиланням для підтвердження на вашу адресу.
          Перейдіть за посиланням у листі, щоб активувати акаунт.
        </p>
        <p className="mt-4 text-sm text-dark-400">
          Не отримали листа? Перевірте папку «Спам» або скористайтесь формою нижче.
        </p>
        <div className="mt-6 rounded-xl border border-dark/10 bg-white p-6 text-left">
          <ResendForm />
        </div>
        <div className="mt-4">
          <Link
            href="/auth/login"
            className="text-sm text-dark-500 hover:text-dark transition-colors"
          >
            ← Повернутися до входу
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-dark-400" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
