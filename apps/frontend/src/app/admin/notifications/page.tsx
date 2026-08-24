'use client';

import { useEffect, useState } from 'react';
import { Bell, Mail, Save, CheckCircle, AlertCircle, Send } from 'lucide-react';
import api from '@/lib/api';

const NOTIFICATION_KEYS = [
  { key: 'admin_email', label: 'Email адміністратора', group: 'notifications', placeholder: 'admin@fish-shop.ua', desc: 'На цю адресу надходять сповіщення про нові замовлення та відгуки' },
  { key: 'smtp_host', label: 'SMTP Host', group: 'notifications', placeholder: 'smtp.gmail.com', desc: 'Хост поштового сервера' },
  { key: 'smtp_port', label: 'SMTP Port', group: 'notifications', placeholder: '587', desc: 'Порт SMTP (587 або 465)' },
  { key: 'smtp_user', label: 'SMTP Логін', group: 'notifications', placeholder: 'your@gmail.com', desc: 'Email аккаунту відправника' },
  { key: 'smtp_pass', label: 'SMTP Пароль', group: 'notifications', placeholder: '••••••••', type: 'password', desc: 'Пароль або App Password' },
  { key: 'resend_api_key', label: 'Resend API Key (альтернатива)', group: 'notifications', placeholder: 're_xxxxxxxxxxxxxxxx', type: 'password', desc: 'Якщо вказано — Resend має пріоритет над SMTP' },
];

const TOGGLE_KEYS = [
  { key: 'notify_new_order', label: 'Сповіщення про нові замовлення' },
  { key: 'notify_new_review', label: 'Сповіщення про нові відгуки' },
  { key: 'notify_new_user', label: 'Сповіщення про нові реєстрації' },
  { key: 'notify_order_status', label: 'Лист клієнту при зміні статусу замовлення' },
  { key: 'notify_abandoned_cart', label: 'Нагадування про покинутий кошик' },
];

export default function NotificationsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    api.get('/settings/admin/all')
      .then(r => {
        const map: Record<string, string> = {};
        for (const s of r.data) map[s.key] = s.value;
        setValues(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setMessage(''); setError('');
    try {
      const settings = [...NOTIFICATION_KEYS, ...TOGGLE_KEYS].map(({ key }) => ({
        key,
        value: values[key] ?? '',
        group: 'notifications',
      }));
      await api.patch('/settings', settings);
      setMessage('Налаштування збережено');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setTestLoading(true);
    try {
      await api.post('/settings/test-email', { email: testEmail });
      setMessage(`Тестовий лист надіслано на ${testEmail}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Помилка відправки тестового листа');
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-3xl bg-white p-8 shadow-sm animate-pulse">
            <div className="h-5 w-48 rounded-full bg-slate-200 mb-4" />
            <div className="space-y-3">
              {[1, 2].map(j => <div key={j} className="h-10 rounded-2xl bg-slate-100" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Адмін-панель</p>
            <h2 className="mt-3 text-3xl font-semibold text-dark">Email нотифікації</h2>
            <p className="mt-2 text-slate-600">Налаштуйте SMTP або Resend для відправки листів</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Bell className="h-7 w-7 text-primary" />
          </div>
        </div>
      </div>

      {/* SMTP Config */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-dark">Налаштування пошти</h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {NOTIFICATION_KEYS.map(({ key, label, placeholder, type, desc }) => (
            <div key={key} className={key === 'admin_email' || key === 'resend_api_key' ? 'sm:col-span-2' : ''}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input
                type={type || 'text'}
                value={values[key] ?? ''}
                onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
              {desc && <p className="mt-1 text-xs text-slate-400">{desc}</p>}
            </div>
          ))}
        </div>

        {/* Test email */}
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-3">Перевірити налаштування</p>
          <div className="flex gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
            <button
              onClick={handleTestEmail}
              disabled={testLoading || !testEmail}
              className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {testLoading ? 'Надсилання...' : 'Тест'}
            </button>
          </div>
        </div>
      </div>

      {/* Notification toggles */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50">
            <Bell className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-dark">Тип нотифікацій</h3>
        </div>

        <div className="space-y-3">
          {TOGGLE_KEYS.map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition">
              <span className="text-sm font-medium text-dark">{label}</span>
              <button
                type="button"
                onClick={() => setValues(v => ({ ...v, [key]: v[key] === 'true' ? 'false' : 'true' }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  values[key] !== 'false' ? 'bg-primary' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    values[key] !== 'false' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 border border-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
      {message && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-700 border border-emerald-200">
          <CheckCircle className="h-5 w-5 shrink-0" />
          {message}
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Збереження...' : 'Зберегти налаштування'}
        </button>
      </div>
    </div>
  );
}
