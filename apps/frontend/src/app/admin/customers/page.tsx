'use client';

import { useEffect, useState } from 'react';
import { User, Search, Shield, Trash2, Ban, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

type Customer = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: string;
  isEmailVerified: boolean;
  isBlocked: boolean;
  blockReason?: string | null;
  createdAt: string;
};

const ROLE_LABEL: Record<string, string> = {
  USER: 'Користувач', MANAGER: 'Менеджер', ADMIN: 'Адмін', SUPER_ADMIN: 'Супер адмін',
};

export default function CustomersPage() {
  const { user: me } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [blockModal, setBlockModal] = useState<{ customer: Customer; blocking: boolean } | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const limit = 20;

  const load = async (q = search, p = page) => {
    setLoading(true);
    try {
      const res = await api.get(`/users?limit=${limit}&page=${p}${q ? `&search=${encodeURIComponent(q)}` : ''}`);
      setCustomers(res.data.data ?? []);
      setTotal(res.data.pagination?.total ?? 0);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); load(search, 1); };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Видалити користувача ${customer.email}? Всі його дані будуть втрачені.`)) return;
    setActionLoading(customer.id);
    try {
      await api.delete(`/users/${customer.id}`);
      setCustomers(cs => cs.filter(c => c.id !== customer.id));
      setTotal(t => t - 1);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Помилка видалення');
    } finally {
      setActionLoading('');
    }
  };

  const handleBlock = async () => {
    if (!blockModal) return;
    setActionLoading(blockModal.customer.id);
    try {
      await api.patch(`/users/${blockModal.customer.id}/block`, {
        blocked: blockModal.blocking,
        reason: blockModal.blocking ? blockReason : undefined,
      });
      setCustomers(cs => cs.map(c =>
        c.id === blockModal.customer.id
          ? { ...c, isBlocked: blockModal.blocking, blockReason: blockModal.blocking ? blockReason : null }
          : c
      ));
      setBlockModal(null);
      setBlockReason('');
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Помилка');
    } finally {
      setActionLoading('');
    }
  };

  const isSuperAdmin = me?.role === 'SUPER_ADMIN';
  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-dark">Клієнти</h1>
        <p className="mt-1 text-sm text-slate-500">Управління користувачами системи</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Всього', value: total, icon: User, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Адмінів', value: customers.filter(c => c.role !== 'USER' && c.role !== 'MANAGER').length, icon: Shield, color: 'text-violet-600', bg: 'bg-violet-100' },
          { label: 'Заблоковано', value: customers.filter(c => c.isBlocked).length, icon: Ban, color: 'text-red-500', bg: 'bg-red-100' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[2rem] bg-white p-5 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xl font-semibold text-dark">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Пошук за email, ім'ям..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <button onClick={handleSearch}
          className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90">
          Пошук
        </button>
      </div>

      {/* Table */}
      <div className="rounded-[2rem] bg-white shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">Користувачів не знайдено</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3.5 text-left">Користувач</th>
                <th className="px-5 py-3.5 text-left hidden md:table-cell">Роль</th>
                <th className="px-5 py-3.5 text-left hidden lg:table-cell">Реєстрація</th>
                <th className="px-5 py-3.5 text-left">Статус</th>
                <th className="px-5 py-3.5 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-4">
                    <p className="font-medium text-dark">{customer.firstName} {customer.lastName ?? ''}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{customer.email}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      customer.role === 'SUPER_ADMIN' ? 'bg-violet-100 text-violet-700' :
                      customer.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                      customer.role === 'MANAGER' ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {ROLE_LABEL[customer.role] ?? customer.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 hidden lg:table-cell">
                    {new Date(customer.createdAt).toLocaleDateString('uk-UA')}
                  </td>
                  <td className="px-5 py-4">
                    {customer.isBlocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        <Ban className="h-3 w-3" /> Заблоковано
                      </span>
                    ) : customer.isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle className="h-3 w-3" /> Активний
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                        Не верифікований
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {customer.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => { setBlockModal({ customer, blocking: !customer.isBlocked }); setBlockReason(''); }}
                          disabled={actionLoading === customer.id}
                          title={customer.isBlocked ? 'Розблокувати' : 'Заблокувати'}
                          className={`rounded-xl p-2 transition ${customer.isBlocked
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500'}`}>
                          {customer.isBlocked ? <CheckCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                        </button>
                      )}
                      {isSuperAdmin && customer.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleDelete(customer)}
                          disabled={actionLoading === customer.id}
                          title="Видалити"
                          className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-1 text-sm text-slate-600">
          <span>Показано {(page - 1) * limit + 1}–{Math.min(page * limit, total)} з {total}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 hover:border-primary hover:text-primary transition">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 hover:border-primary hover:text-primary transition">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Block modal */}
      {blockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-dark">
              {blockModal.blocking ? 'Заблокувати користувача' : 'Розблокувати користувача'}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {blockModal.blocking
                ? `Користувач ${blockModal.customer.email} більше не зможе входити в систему.`
                : `Користувач ${blockModal.customer.email} знову отримає доступ до системи.`}
            </p>
            {blockModal.blocking && (
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Причина блокування (необов'язково)</label>
                <input value={blockReason} onChange={e => setBlockReason(e.target.value)}
                  placeholder="Порушення правил..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none" />
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button onClick={handleBlock} disabled={actionLoading === blockModal.customer.id}
                className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold text-white transition ${blockModal.blocking ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                {actionLoading === blockModal.customer.id ? '...' : blockModal.blocking ? 'Заблокувати' : 'Розблокувати'}
              </button>
              <button onClick={() => setBlockModal(null)}
                className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300 transition">
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
