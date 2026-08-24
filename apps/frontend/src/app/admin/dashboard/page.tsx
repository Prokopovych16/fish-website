'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, DollarSign, Package, ShoppingBag, Users, TrendingUp, Calendar } from 'lucide-react'
import api from '@/lib/api'
import { StatCard } from '@/components/admin/stat-card'
import { Button } from '@/components/ui/button'

type OrderStatusKey = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

type DashboardStats = {
  totalOrders: number
  totalRevenue: number
  ordersByStatus: Array<{ status: OrderStatusKey; _count: number }>
  ordersByPaymentMethod: Array<{ paymentMethod: string; _count: number }>
  ordersByDeliveryMethod: Array<{ deliveryMethod: string; _count: number }>
}

type OrderSummary = {
  id: string
  orderNumber: string
  contactFirstName: string
  contactLastName: string
  total: number
  status: OrderStatusKey
  paymentMethod: string
  deliveryMethod: string
  createdAt: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [latestOrders, setLatestOrders] = useState<OrderSummary[]>([])
  const [counts, setCounts] = useState({ products: 0, categories: 0, customers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsResponse, productsResponse, categoriesResponse, usersResponse, ordersResponse] = await Promise.all([
          api.get('/orders/stats/overview').catch(() => ({ data: {} })),
          api.get('/products?limit=1&onlyActive=false&minimal=true').catch(() => ({ data: { pagination: { total: 0 } } })),
          api.get('/categories?includeInactive=true').catch(() => ({ data: [] })),
          api.get('/users?limit=1').catch(() => ({ data: { pagination: { total: 0 } } })),
          api.get('/orders?limit=5').catch(() => ({ data: { data: [] } })),
        ])

        const categoryTree = categoriesResponse.data
        const flattenCategories = (items: any[]): any[] =>
          items.reduce((acc, item) => acc.concat(item, flattenCategories(item.children || [])), [] as any[])

        setStats(statsResponse.data)
        setCounts({
          products: productsResponse.data?.pagination?.total || 0,
          categories: flattenCategories(categoryTree).length,
          customers: usersResponse.data?.pagination?.total || 0,
        })
        setLatestOrders(ordersResponse.data?.data || [])
      } catch (error) {
        console.error('Dashboard load error', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const overview = useMemo(
    () => [
      {
        label: 'Замовлень всього',
        value: stats?.totalOrders || 0,
        icon: Package,
        color: 'primary',
        trend: { value: 12, direction: 'up' as const },
      },
      {
        label: 'Виручка',
        value: `₴${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`,
        icon: DollarSign,
        color: 'emerald',
        trend: { value: 8, direction: 'up' as const },
      },
      {
        label: 'Товарів',
        value: counts.products,
        icon: ShoppingBag,
        color: 'slate',
      },
      {
        label: 'Клієнтів',
        value: counts.customers,
        icon: Users,
        color: 'orange',
        trend: { value: 5, direction: 'up' as const },
      },
    ],
    [counts.customers, counts.products, stats],
  )

  const statusColors: Record<OrderStatusKey, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-cyan-100 text-cyan-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-slate-100 text-slate-800',
  }

  const statusLabels: Record<OrderStatusKey, string> = {
    PENDING: 'Очікування',
    CONFIRMED: 'Підтверджено',
    PROCESSING: 'В обробці',
    SHIPPED: 'Відправлено',
    DELIVERED: 'Доставлено',
    CANCELLED: 'Скасовано',
    REFUNDED: 'Повернено',
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-dark mb-2">Панель керування</h1>
            <p className="text-slate-600 flex items-center gap-2">
              <Calendar size={16} />
              {new Date().toLocaleDateString('uk-UA', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link href="/admin/orders">
            <Button variant="primary" size="lg" className="flex items-center gap-2">
              Усі замовлення
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overview.map((stat, index) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            delay={index * 0.1}
            loading={loading}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Orders */}
        <motion.div
          className="lg:col-span-2 rounded-2xl border border-white/20 bg-white/50 backdrop-blur-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="px-6 py-5 border-b border-slate-200/30 flex items-center justify-between">
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Нові замовлення
            </h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-primary hover:text-primary/80 transition flex items-center gap-1">
              Усі <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-200/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Номер</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Клієнт</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Сума</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-3">
                        <div className="h-5 w-full animate-pulse rounded-lg bg-slate-200/70" />
                      </td>
                    </tr>
                  ))
                ) : latestOrders.length > 0 ? (
                  latestOrders.map((order) => (
                    <motion.tr
                      key={order.id}
                      className="hover:bg-slate-50/50 transition-colors"
                      whileHover={{ backgroundColor: 'rgba(15, 23, 42, 0.02)' }}
                    >
                      <td className="px-6 py-3 text-sm font-medium text-slate-700">{order.orderNumber}</td>
                      <td className="px-6 py-3 text-sm text-slate-700">{order.contactFirstName} {order.contactLastName}</td>
                      <td className="px-6 py-3 text-sm font-bold text-primary">₴{Number(order.total).toLocaleString('uk-UA')}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Замовлень немає
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-bold text-dark">Швидкі дії</h3>
          <div className="space-y-3">
            {[
              { label: 'Новий товар', href: '/admin/products', icon: '➕' },
              { label: 'Категорії', href: '/admin/categories', icon: '📂' },
              { label: 'Налаштування', href: '/admin/settings', icon: '⚙️' },
              { label: 'Відгуки', href: '/admin/reviews', icon: '⭐' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg bg-white/50 backdrop-blur-xl border border-white/20 hover:border-white/40 p-4 transition-all hover:translate-x-1"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="font-medium text-slate-700">{action.label}</span>
                <ArrowRight size={16} className="ml-auto text-slate-400" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}