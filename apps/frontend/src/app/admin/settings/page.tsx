'use client';

import { useEffect, useState } from 'react';
import { Settings2, Bell, CreditCard, Mail, Truck, Save, Eye, EyeOff, Send, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

type Setting = { key: string; value: string; label: string | null; group: string };

// Визначення полів по секціях
const SECTIONS = [
  {
    group: 'general',
    title: 'Загальні',
    icon: Settings2,
    fields: [
      { key: 'site_name',        label: 'Назва сайту' },
      { key: 'site_description', label: 'Опис сайту' },
      { key: 'site_url',         label: 'URL сайту' },
      { key: 'phone',            label: 'Телефон' },
      { key: 'address',          label: 'Адреса' },
    ],
  },
  {
    group: 'notifications',
    title: 'Email / SMTP',
    icon: Mail,
    fields: [
      { key: 'smtp_host', label: 'SMTP Хост' },
      { key: 'smtp_port', label: 'SMTP Порт' },
      { key: 'smtp_user', label: 'SMTP Логін (email)' },
      { key: 'smtp_pass', label: 'SMTP Пароль (App Password)', secret: true },
      { key: 'smtp_from', label: 'Відправник (From)' },
      { key: 'admin_email', label: 'Email адміністратора (для нотифікацій)' },
    ],
  },
  {
    group: 'delivery',
    title: 'Доставка',
    icon: Truck,
    fields: [
      { key: 'free_shipping_threshold', label: 'Поріг безкоштовної доставки (грн)' },
      { key: 'nova_poshta_api_key',     label: 'Нова Пошта API ключ', secret: true },
    ],
  },
  {
    group: 'payments',
    title: 'Платежі',
    icon: CreditCard,
    fields: [
      {
        key: 'payment_provider',
        label: 'Активний платіжний провайдер',
        options: [
          { value: 'wayforpay', label: 'WayForPay' },
          { value: 'liqpay', label: 'LiqPay' },
        ],
      },
      { key: 'wayforpay_merchant_account', label: 'WayForPay Merchant Account' },
      { key: 'wayforpay_merchant_secret_key', label: 'WayForPay Merchant Secret Key', secret: true },
      { key: 'wayforpay_merchant_domain', label: 'WayForPay Merchant Domain Name' },
      { key: 'liqpay_public_key',  label: 'LiqPay Public Key' },
      { key: 'liqpay_private_key', label: 'LiqPay Private Key', secret: true },
    ],
  },
  {
    group: 'pixels',
    title: 'Пікселі & Аналітика',
    icon: Bell,
    fields: [
      { key: 'fb_pixel_id',        label: 'Facebook Pixel ID' },
      { key: 'ga4_measurement_id', label: 'Google Analytics 4 ID' },
      { key: 'gtm_id',             label: 'Google Tag Manager ID' },
    ],
  },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  // Test email state
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    api.get('/settings/admin/all')
      .then(r => {
        const map: Record<string, string> = {};
        for (const s of (r.data as Setting[])) map[s.key] = s.value;
        setValues(map);
        // Підставити email адміна за замовчуванням для тесту
        setTestEmail(map['admin_email'] || user?.email || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (key: string, group: string, label: string | null) => {
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await api.patch(`/settings/${key}`, { value: values[key] ?? '', group, label });
      setSaved(s => ({ ...s, [key]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2500);
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  const handleSaveSection = async (section: typeof SECTIONS[0]) => {
    for (const f of section.fields) {
      await handleSave(f.key, section.group, f.label);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setTesting(true);
    setTestResult(null);
    try {
      const r = await api.post('/settings/test-email', { email: testEmail });
      setTestResult(r.data);
    } catch (e: any) {
      setTestResult({ success: false, message: e?.response?.data?.message || 'Помилка запиту' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => <div key={i} className="h-40 animate-pulse rounded-[2rem] bg-white" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-dark">Налаштування сайту</h1>
        <p className="mt-1 text-sm text-slate-500">Зміни вступають в силу одразу після збереження</p>
      </div>

      {SECTIONS.map(section => {
        const Icon = section.icon;
        const isEmail = section.group === 'notifications';
        return (
          <div key={section.group} className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-semibold text-dark">{section.title}</h2>
              </div>
              <button
                onClick={() => handleSaveSection(section)}
                className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
                <Save className="h-3.5 w-3.5" />
                Зберегти все
              </button>
            </div>

            <div className="space-y-4">
              {section.fields.map(f => {
                const isSecret = (f as any).secret;
                const options = (f as any).options as { value: string; label: string }[] | undefined;
                const show = showSecret[f.key];
                const isSaved = saved[f.key];
                const isSaving = saving[f.key];
                return (
                  <div key={f.key}>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">{f.label}</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        {options ? (
                          <select
                            value={values[f.key] ?? options[0]?.value ?? ''}
                            onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none"
                          >
                            {options.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={isSecret && !show ? 'password' : 'text'}
                            value={values[f.key] ?? ''}
                            onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                            placeholder={f.key}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none pr-10"
                          />
                        )}
                        {isSecret && !options && (
                          <button type="button" onClick={() => setShowSecret(s => ({ ...s, [f.key]: !s[f.key] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleSave(f.key, section.group, f.label)}
                        disabled={isSaving}
                        className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-2.5 text-xs font-semibold transition ${
                          isSaved ? 'bg-emerald-500 text-white' : 'border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                        }`}>
                        {isSaved ? <CheckCircle className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                        {isSaving ? '...' : isSaved ? 'OK' : 'Save'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Тест SMTP — тільки для секції notifications */}
            {isEmail && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-4">
                <p className="mb-3 text-sm font-medium text-slate-700">Тест SMTP підключення</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    placeholder="Введіть email для тесту"
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none"
                  />
                  <button
                    onClick={handleTestEmail}
                    disabled={testing || !testEmail}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                    <Send className="h-3.5 w-3.5" />
                    {testing ? 'Надсилання...' : 'Надіслати тест'}
                  </button>
                </div>
                {testResult && (
                  <div className={`mt-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${testResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {testResult.success ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                    {testResult.message}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
