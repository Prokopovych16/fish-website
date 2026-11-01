'use client';

import { useState } from 'react';
import { User, Mail, Phone, Edit3, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user, refreshUser } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true); setProfileError(''); setProfileSuccess('');
    try {
      await api.patch('/auth/profile', formData);
      await refreshUser();
      setProfileSuccess('Профіль оновлено');
      setIsEditing(false);
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setProfileError(Array.isArray(msg) ? msg[0] : msg || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });
    setIsEditing(false);
    setProfileError('');
  };

  const handleChangePassword = async () => {
    setPwError(''); setPwSuccess('');
    if (!pwForm.current) { setPwError('Введіть поточний пароль'); return; }
    if (pwForm.next.length < 8) { setPwError('Новий пароль повинен мати мінімум 8 символів'); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(pwForm.next)) {
      setPwError('Пароль повинен містити заголовну букву, цифру та спецсимвол (@$!%*?&)');
      return;
    }
    if (pwForm.next !== pwForm.confirm) { setPwError('Паролі не співпадають'); return; }
    setPwSaving(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwSuccess('Пароль змінено успішно');
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setPwError(Array.isArray(msg) ? msg[0] : msg || 'Помилка зміни пароля');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="rounded-3xl border border-dark/10 bg-white p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-dark">Мій профіль</h1>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-lg border border-dark/10 px-5 py-2.5 text-sm font-medium text-dark-500 transition hover:border-dark/30 hover:text-dark">
              <Edit3 className="h-4 w-4" /> Редагувати
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-dark px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-dark-700 disabled:opacity-60 min-h-[44px] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(22,24,28,0.2)] active:scale-[0.98]">
                <Save className="h-4 w-4" /> {saving ? 'Збереження...' : 'Зберегти'}
              </button>
              <button onClick={handleCancel}
                className="flex items-center gap-2 rounded-lg border border-dark/10 px-5 py-2.5 text-sm font-medium text-dark-500 transition hover:bg-dark-50">
                <X className="h-4 w-4" /> Скасувати
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-dark-50 text-dark-500">
            <User className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-dark">{user.firstName} {user.lastName}</h2>
            <p className="text-dark-400 text-sm">{user.email}</p>
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-dark-50 px-3 py-1 text-xs font-medium text-dark-600">
              {user.loyaltyPoints} балів лояльності
            </div>
          </div>
        </div>

        {profileSuccess && <p className="mb-4 rounded-lg bg-sage-50 px-4 py-3 text-sm text-sage-600">{profileSuccess}</p>}
        {profileError && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{profileError}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <ProfileField label="Ім'я" icon={<User className="h-4 w-4 text-dark-400" />}
            editing={isEditing} value={isEditing ? formData.firstName : (user.firstName || '—')}
            onChange={v => setFormData(p => ({ ...p, firstName: v }))} placeholder="Іван" />
          <ProfileField label="Прізвище" icon={<User className="h-4 w-4 text-dark-400" />}
            editing={isEditing} value={isEditing ? formData.lastName : (user.lastName || '—')}
            onChange={v => setFormData(p => ({ ...p, lastName: v }))} placeholder="Петренко" />
          <div className="flex items-center gap-3 rounded-lg bg-dark-50 p-4">
            <Mail className="h-4 w-4 text-dark-400 shrink-0" />
            <div>
              <p className="text-xs text-dark-400">Email</p>
              <p className="text-sm font-medium text-dark">{user.email}</p>
            </div>
          </div>
          <ProfileField label="Телефон" icon={<Phone className="h-4 w-4 text-dark-400" />}
            editing={isEditing} value={isEditing ? formData.phone : (user.phone || '—')}
            onChange={v => setFormData(p => ({ ...p, phone: v }))} placeholder="+380501234567" type="tel" />
        </div>

        <div className="mt-6 flex gap-3">
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${user.isEmailVerified ? 'bg-sage-50 text-sage-600' : 'bg-dark-50 text-dark-500'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${user.isEmailVerified ? 'bg-sage-600' : 'bg-dark-400'}`} />
            {user.isEmailVerified ? 'Email підтверджений' : 'Email не підтверджений'}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-sage-50 px-3 py-1.5 text-xs font-medium text-sage-600">
            <span className="h-1.5 w-1.5 rounded-full bg-sage-600" />
            Акаунт активний
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-3xl border border-dark/10 bg-white p-8">
        <div className="mb-6 flex items-center gap-3">
          <Lock className="h-5 w-5 text-dark-500" />
          <h2 className="text-xl font-semibold text-dark">Зміна пароля</h2>
        </div>

        {pwSuccess && <p className="mb-4 rounded-lg bg-sage-50 px-4 py-3 text-sm text-sage-600">{pwSuccess}</p>}
        {pwError && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{pwError}</p>}

        <div className="grid gap-4 sm:grid-cols-3">
          <PasswordField label="Поточний пароль" value={pwForm.current} onChange={v => setPwForm(p => ({ ...p, current: v }))} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
          <PasswordField label="Новий пароль" value={pwForm.next} onChange={v => setPwForm(p => ({ ...p, next: v }))} show={showNext} onToggle={() => setShowNext(v => !v)} />
          <PasswordField label="Підтвердити пароль" value={pwForm.confirm} onChange={v => setPwForm(p => ({ ...p, confirm: v }))} show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
        </div>

        <button onClick={handleChangePassword} disabled={pwSaving}
          className="mt-5 rounded-xl bg-dark px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-dark-700 disabled:opacity-60 min-h-[44px] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(22,24,28,0.2)] active:scale-[0.98]">
          {pwSaving ? 'Збереження...' : 'Змінити пароль'}
        </button>
      </div>
    </div>
  );
}

function ProfileField({ label, icon, editing, value, onChange, placeholder, type = 'text' }: { label: string; icon: React.ReactNode; editing: boolean; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg p-4 ${editing ? 'bg-white border border-dark/10' : 'bg-dark-50'}`}>
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-dark-400">{label}</p>
        {editing ? (
          <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="mt-0.5 w-full bg-transparent text-sm font-medium text-dark focus:outline-none" />
        ) : (
          <p className="text-sm font-medium text-dark truncate">{value}</p>
        )}
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-dark-600">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
          className="w-full rounded-lg border border-dark/10 bg-white px-4 py-3 pr-10 text-sm focus:border-dark/30 focus:outline-none" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-500">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
