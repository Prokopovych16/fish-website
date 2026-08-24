'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Truck, CreditCard, CheckCircle, Package, ChevronRight, Search } from 'lucide-react';
import { useCartStore } from '@/lib/cart';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import { pixel } from '@/lib/pixel';
import { submitPaymentForm } from '@/lib/submit-payment-form';

const STEPS = [
  { id: 'contact', label: 'Контактні дані', icon: User },
  { id: 'delivery', label: 'Доставка', icon: Truck },
  { id: 'payment', label: 'Оплата', icon: CreditCard },
  { id: 'confirm', label: 'Підтвердження', icon: CheckCircle },
];

const DELIVERY_METHODS = [
  { value: 'NOVA_POSHTA_BRANCH', label: 'Нова Пошта — відділення' },
  { value: 'NOVA_POSHTA_COURIER', label: "Нова Пошта — кур'єр" },
  { value: 'PICKUP', label: 'Самовивіз' },
];

const PAYMENT_METHODS = [
  { value: 'CARD_ONLINE', label: 'Оплата карткою онлайн', desc: 'Visa / MasterCard через захищений платіжний сервіс' },
];

type FormData = {
  firstName: string; lastName: string; phone: string; email: string;
  deliveryMethod: string; city: string; cityRef: string;
  branch: string; branchRef: string; deliveryAddress: string;
  paymentMethod: string; comment: string;
};

function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, summary, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tierDiscount, setTierDiscount] = useState<{ percent: number; name: string } | null>(null);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3000);
  const [form, setForm] = useState<FormData>({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    phone: user?.phone || '', email: user?.email || '',
    deliveryMethod: 'NOVA_POSHTA_BRANCH', city: '', cityRef: '',
    branch: '', branchRef: '', deliveryAddress: '',
    paymentMethod: 'CARD_ONLINE', comment: '',
  });

  const [citySearch, setCitySearch] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState('');
  const [branches, setBranches] = useState<any[]>([]);
  const [branchesOpen, setBranchesOpen] = useState(false);

  const debouncedCity = useDebounce(citySearch, 350);
  const debouncedBranch = useDebounce(branchSearch, 350);
  const cityDropRef = useRef<HTMLDivElement>(null);
  const branchDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedCity.length < 2) { setCities([]); return; }
    api.get(`/nova-poshta/cities?search=${encodeURIComponent(debouncedCity)}`).then(r => setCities(r.data)).catch(() => setCities([]));
  }, [debouncedCity]);

  useEffect(() => {
    if (!form.cityRef) return;
    api.get(`/nova-poshta/branches?cityRef=${form.cityRef}&search=${encodeURIComponent(debouncedBranch)}`).then(r => setBranches(r.data)).catch(() => setBranches([]));
  }, [form.cityRef, debouncedBranch]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (cityDropRef.current && !cityDropRef.current.contains(e.target as Node)) setCitiesOpen(false);
      if (branchDropRef.current && !branchDropRef.current.contains(e.target as Node)) setBranchesOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    api.get('/settings').then((r: any) => {
      const s: { key: string; value: string }[] = r.data;
      const t = s.find(x => x.key === 'free_shipping_threshold');
      if (t) setFreeShippingThreshold(Number(t.value) || 3000);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/loyalty/tiers').then(r => {
      const tiers: { name: string; min: number; discount: number }[] = r.data.tiers ?? [];
      const points = user.loyaltyPoints ?? 0;
      const tier = [...tiers].reverse().find(t => points >= t.min) ?? tiers[0];
      if (tier && tier.discount > 0) setTierDiscount({ percent: tier.discount, name: tier.name });
    }).catch(() => {});
  }, [user]);

  const tierDiscountAmount = tierDiscount
    ? Math.round(summary.subtotal * (tierDiscount.percent / 100) * 100) / 100
    : 0;

  const effectiveSubtotal = summary.total - tierDiscountAmount;
  const estimatedDeliveryCost =
    form.deliveryMethod === 'NOVA_POSHTA_COURIER'
      ? effectiveSubtotal >= freeShippingThreshold ? 0 : 50
      : 0;

  const setF = (key: keyof FormData, val: string) => setForm(f => ({ ...f, [key]: val }));

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Package className="h-16 w-16 text-dark-200 mx-auto" />
          <h1 className="text-2xl font-semibold text-dark">Кошик порожній</h1>
          <Link href="/catalog" className="inline-flex items-center gap-2 rounded-lg bg-dark px-6 py-3 text-sm font-medium text-white hover:bg-dark-700 transition-colors">До каталогу</Link>
        </div>
      </main>
    );
  }

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.firstName.trim()) return "Введіть ім'я";
      if (!form.lastName.trim()) return 'Введіть прізвище';
      if (!form.phone.trim()) return 'Введіть телефон';
      if (!form.email.trim()) return 'Введіть email';
    }
    if (step === 1 && (form.deliveryMethod === 'NOVA_POSHTA_BRANCH' || form.deliveryMethod === 'NOVA_POSHTA_COURIER')) {
      if (!form.cityRef) return 'Оберіть місто';
      if (form.deliveryMethod === 'NOVA_POSHTA_BRANCH' && !form.branchRef) return 'Оберіть відділення';
      if (form.deliveryMethod === 'NOVA_POSHTA_COURIER' && !form.deliveryAddress.trim()) return 'Введіть адресу';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    const nextStep = step + 1;
    if (nextStep === 3) {
      pixel.initiateCheckout(summary.total, items.length);
    }
    setStep(nextStep);
  };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const body: any = {
        contactFirstName: form.firstName, contactLastName: form.lastName,
        contactPhone: form.phone, contactEmail: form.email,
        deliveryMethod: form.deliveryMethod, paymentMethod: form.paymentMethod,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      };
      if (form.comment) body.comment = form.comment;
      if (form.deliveryMethod === 'NOVA_POSHTA_BRANCH') {
        body.npCityName = form.city; body.npBranchName = form.branch; body.npBranchRef = form.branchRef;
      } else if (form.deliveryMethod === 'NOVA_POSHTA_COURIER') {
        body.npCityName = form.city; body.deliveryAddress = form.deliveryAddress;
      }
      const res = await api.post('/orders', body);
      pixel.purchase(res.data.id, summary.total, items.map(i => i.productId));

      // Для онлайн-оплати карткою — намагаємось одразу відкрити форму активного
      // платіжного провайдера (WayForPay за замовчуванням, або інший — з налаштувань).
      // Замовлення вже створено, тож навіть якщо цей крок не вдасться (наприклад,
      // провайдер ще не налаштований), користувача все одно переносимо на сторінку
      // статусу замовлення, де можна повторити спробу оплати — а не залишаємо
      // його на чекауті з порожнім кошиком і незрозумілою помилкою.
      if (form.paymentMethod === 'CARD_ONLINE') {
        try {
          const checkout = await api.get(`/payments/checkout?orderId=${res.data.id}`);
          await clearCart();
          submitPaymentForm(checkout.data);
          return;
        } catch (payErr: any) {
          const msg: string = payErr?.response?.data?.message || '';
          // Якщо провайдер не налаштований — покажемо помилку адміну, не ховаємо
          if (msg) {
            setError(`Не вдалося відкрити форму оплати: ${msg}`);
          } else {
            // Невідома помилка — відправляємо на сторінку статусу де є кнопка "Оплатити"
            await clearCart();
            router.push(`/checkout/success?order=${res.data.orderNumber}`);
            return;
          }
          setLoading(false);
          return;
        }
      }

      await clearCart();
      router.push(`/checkout/success?order=${res.data.orderNumber}`);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Помилка при оформленні замовлення');
    } finally {
      setLoading(false);
    }
  };

  const currentStepId = STEPS[step].id;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
      <Link href="/cart" className="mb-8 inline-flex items-center gap-2 text-sm text-dark-400 hover:text-dark transition">
        <ArrowLeft className="h-4 w-4" /> Назад до кошика
      </Link>

      {/* Step indicator */}
      <div className="mb-10 flex items-center">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className={`flex items-center gap-2 ${active || done ? 'text-dark' : 'text-dark-300'}`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${active || done ? 'bg-dark text-white' : 'bg-dark-100'}`}>
                  {done ? '✓' : <Icon className="h-4 w-4" />}
                </div>
                <span className="hidden text-sm font-medium sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`mx-3 flex-1 h-0.5 ${i < step ? 'bg-dark' : 'bg-dark-100'}`} />}
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white p-8 shadow-sm border border-dark/10">

            {/* Step 0 — Contact */}
            {currentStepId === 'contact' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-dark">Контактні дані</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField label="Ім'я *" value={form.firstName} onChange={v => setF('firstName', v)} placeholder="Іван" />
                  <InputField label="Прізвище *" value={form.lastName} onChange={v => setF('lastName', v)} placeholder="Петренко" />
                  <InputField label="Телефон *" value={form.phone} onChange={v => setF('phone', v)} placeholder="+380501234567" type="tel" />
                  <InputField label="Email *" value={form.email} onChange={v => setF('email', v)} placeholder="ivan@example.com" type="email" />
                </div>
              </div>
            )}

            {/* Step 1 — Delivery */}
            {currentStepId === 'delivery' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-dark">Доставка</h2>
                <div className="grid gap-3">
                  {DELIVERY_METHODS.map(m => (
                    <label key={m.value} className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition ${form.deliveryMethod === m.value ? 'border-dark bg-dark-50' : 'border-dark/10 hover:border-dark/20'}`}>
                      <input type="radio" name="delivery" value={m.value} checked={form.deliveryMethod === m.value} onChange={() => { setF('deliveryMethod', m.value); setF('city', ''); setF('cityRef', ''); setF('branch', ''); setF('branchRef', ''); }} className="accent-primary" />
                      <span className="font-medium text-dark">{m.label}</span>
                    </label>
                  ))}
                </div>

                {(form.deliveryMethod === 'NOVA_POSHTA_BRANCH' || form.deliveryMethod === 'NOVA_POSHTA_COURIER') && (
                  <div className="space-y-4">
                    {/* City */}
                    <div ref={cityDropRef} className="relative">
                      <label className="mb-1.5 block text-sm font-medium text-dark-600">Місто *</label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
                        <input
                          value={form.city || citySearch}
                          onChange={e => { setCitySearch(e.target.value); setF('city', ''); setF('cityRef', ''); setCitiesOpen(true); }}
                          onFocus={() => { if (!form.cityRef) setCitiesOpen(true); }}
                          placeholder="Пошук міста..."
                          className="w-full rounded-lg border border-dark/10 bg-white py-3 pl-10 pr-4 text-sm focus:border-dark/30 focus:outline-none"
                        />
                      </div>
                      {citiesOpen && cities.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full rounded-lg border border-dark/10 bg-white shadow-xl">
                          {cities.slice(0, 8).map((c, i) => (
                            <button key={i} type="button"
                              onClick={() => { setF('city', c.mainDescription || c.name); setF('cityRef', c.ref); setCitySearch(''); setCitiesOpen(false); setBranches([]); setBranchSearch(''); setF('branch', ''); setF('branchRef', ''); }}
                              className="flex w-full flex-col items-start px-4 py-3 text-left text-sm hover:bg-dark-50 first:rounded-t-2xl last:rounded-b-2xl border-b border-dark/10 last:border-0">
                              <span className="font-medium text-dark">{c.mainDescription}</span>
                              <span className="text-xs text-dark-400">{c.area} обл.</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Branch */}
                    {form.deliveryMethod === 'NOVA_POSHTA_BRANCH' && form.cityRef && (
                      <div ref={branchDropRef} className="relative">
                        <label className="mb-1.5 block text-sm font-medium text-dark-600">Відділення *</label>
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
                          <input
                            value={form.branch || branchSearch}
                            onChange={e => { setBranchSearch(e.target.value); setF('branch', ''); setF('branchRef', ''); setBranchesOpen(true); }}
                            onFocus={() => { if (!form.branchRef) setBranchesOpen(true); }}
                            placeholder="Пошук або номер відділення..."
                            className="w-full rounded-lg border border-dark/10 bg-white py-3 pl-10 pr-4 text-sm focus:border-dark/30 focus:outline-none"
                          />
                        </div>
                        {branchesOpen && branches.length > 0 && (
                          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-dark/10 bg-white shadow-xl">
                            {branches.slice(0, 20).map((b, i) => (
                              <button key={i} type="button"
                                onClick={() => { setF('branch', b.shortAddress || b.name); setF('branchRef', b.ref); setBranchSearch(''); setBranchesOpen(false); }}
                                className="flex w-full flex-col items-start px-4 py-3 text-left text-sm hover:bg-dark-50 first:rounded-t-2xl last:rounded-b-2xl border-b border-dark/10 last:border-0">
                                <span className="font-medium text-dark">{b.shortAddress}</span>
                                <span className="text-xs text-dark-400">{b.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Courier address */}
                    {form.deliveryMethod === 'NOVA_POSHTA_COURIER' && form.cityRef && (
                      <InputField label="Адреса доставки *" value={form.deliveryAddress} onChange={v => setF('deliveryAddress', v)} placeholder="вул. Хрещатик, 1, кв. 5" />
                    )}
                  </div>
                )}

                {form.deliveryMethod === 'PICKUP' && (
                  <div className="rounded-lg bg-dark-50 p-4 text-sm text-dark-500">
                    📍 Самовивіз: м. Хмільник, Вінницька обл. Уточніть час за телефоном.
                  </div>
                )}
              </div>
            )}

            {/* Step 2 — Payment */}
            {currentStepId === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-dark">Спосіб оплати</h2>
                <div className="grid gap-3">
                  {PAYMENT_METHODS.map(m => (
                    <label key={m.value} className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition ${form.paymentMethod === m.value ? 'border-dark bg-dark-50' : 'border-dark/10 hover:border-dark/20'}`}>
                      <input type="radio" name="payment" value={m.value} checked={form.paymentMethod === m.value} onChange={() => setF('paymentMethod', m.value)} className="accent-primary" />
                      <div>
                        <p className="font-medium text-dark">{m.label}</p>
                        <p className="text-xs text-dark-400 mt-0.5">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                  ℹ️ Доставка здійснюється виключно за 100% передплатою. Замовлення відправляємо після підтвердження оплати.
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-600">Коментар до замовлення</label>
                  <textarea value={form.comment} onChange={e => setF('comment', e.target.value)} rows={3} placeholder="Побажання до замовлення..."
                    className="w-full rounded-lg border border-dark/10 bg-white px-4 py-3 text-sm focus:border-dark/30 focus:outline-none resize-none" />
                </div>
              </div>
            )}

            {/* Step 3 — Confirm */}
            {currentStepId === 'confirm' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-dark">Підтвердження замовлення</h2>
                <div className="space-y-3 rounded-lg bg-dark-50 p-5 text-sm">
                  <SummaryRow label="Ім'я" value={`${form.firstName} ${form.lastName}`} />
                  <SummaryRow label="Телефон" value={form.phone} />
                  <SummaryRow label="Email" value={form.email} />
                  <div className="border-t border-dark/10 pt-3 space-y-3">
                    <SummaryRow label="Доставка" value={DELIVERY_METHODS.find(m => m.value === form.deliveryMethod)?.label || ''} />
                    {form.city && <SummaryRow label="Місто" value={form.city} />}
                    {form.branch && <SummaryRow label="Відділення" value={form.branch} />}
                    {form.deliveryAddress && <SummaryRow label="Адреса" value={form.deliveryAddress} />}
                  </div>
                  <div className="border-t border-dark/10 pt-3">
                    <SummaryRow label="Оплата" value={PAYMENT_METHODS.find(m => m.value === form.paymentMethod)?.label || ''} />
                  </div>
                  {form.comment && <div className="border-t border-dark/10 pt-3"><SummaryRow label="Коментар" value={form.comment} /></div>}
                </div>

              </div>
            )}

            {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

            <div className={`mt-8 flex ${step > 0 ? 'justify-between' : 'justify-end'}`}>
              {step > 0 && (
                <button onClick={() => { setStep(s => s - 1); setError(''); }}
                  className="rounded-lg border border-dark/10 px-6 py-3 text-sm font-semibold text-dark-500 transition hover:border-dark/20 hover:bg-dark-50">
                  ← Назад
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={handleNext}
                  className="flex items-center gap-2 rounded-lg bg-dark px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-dark-700 active:scale-[0.98]">
                  Далі <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-dark px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-dark-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? 'Оформлення...' : 'Оформити замовлення ✓'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 rounded-xl bg-white p-6 shadow-sm border border-dark/10 space-y-5">
            <h3 className="font-semibold text-dark">Ваше замовлення</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.productId} className="flex gap-3 text-sm">
                  {item.image && <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover flex-shrink-0 bg-dark-50" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-dark line-clamp-1">{item.name}</p>
                    <p className="text-dark-400">{item.quantity} × {item.price.toLocaleString('uk-UA')} грн</p>
                  </div>
                  <p className="font-semibold text-dark shrink-0">{item.total.toLocaleString('uk-UA')} грн</p>
                </div>
              ))}
            </div>
            <div className="border-t border-dark/10 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-dark-400">
                <span>Товари ({summary.totalItems})</span>
                <span>{summary.subtotal.toLocaleString('uk-UA')} грн</span>
              </div>
              {summary.totalDiscount > 0 && (
                <div className="flex justify-between text-sage-600">
                  <span>Знижка на товари</span>
                  <span>−{summary.totalDiscount.toLocaleString('uk-UA')} грн</span>
                </div>
              )}
              {tierDiscount && tierDiscountAmount > 0 && (
                <div className="flex justify-between text-sage-600">
                  <span>Рівень «{tierDiscount.name}» ({tierDiscount.percent}%)</span>
                  <span>−{tierDiscountAmount.toLocaleString('uk-UA')} грн</span>
                </div>
              )}
              <div className="flex justify-between text-dark-400">
                <span>Доставка</span>
                <span>
                  {form.deliveryMethod === 'NOVA_POSHTA_BRANCH'
                    ? 'За тарифами НП'
                    : estimatedDeliveryCost === 0
                    ? 'Безкоштовно'
                    : `${estimatedDeliveryCost} грн`}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-dark/10">
                <span className="text-dark">Разом</span>
                <span className="text-dark">
                  {(effectiveSubtotal + estimatedDeliveryCost).toLocaleString('uk-UA')} грн
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-dark-600">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-dark/10 bg-white px-4 py-3 text-sm focus:border-dark/30 focus:outline-none" />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-dark-400 shrink-0">{label}</span>
      <span className="font-medium text-dark text-right">{value}</span>
    </div>
  );
}
