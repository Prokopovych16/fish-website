'use client';

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  delay?: number
  loading?: boolean
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  delay = 0,
  loading = false,
}: StatCardProps) {
  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    primary: { bg: 'bg-gradient-to-br from-primary/10 to-cyan-100/5', text: 'text-primary', icon: 'text-primary' },
    emerald: { bg: 'bg-gradient-to-br from-emerald-100/20 to-emerald-50/5', text: 'text-emerald-700', icon: 'text-emerald-600' },
    orange: { bg: 'bg-gradient-to-br from-orange-100/20 to-orange-50/5', text: 'text-orange-700', icon: 'text-orange-600' },
    slate: { bg: 'bg-gradient-to-br from-slate-100/20 to-slate-50/5', text: 'text-slate-700', icon: 'text-slate-600' },
  }

  const colors = colorMap[color] || colorMap.primary

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl border border-white/20 bg-white/50 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${colors.bg}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600">{label}</p>
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-200/70" />
            ) : (
              <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
            )}
            {trend && !loading && (
              <div className={`text-xs font-semibold flex items-center gap-1 ${trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}% цього місяця
              </div>
            )}
          </div>
          <div className={`rounded-lg p-3 ${colors.bg} border border-white/30`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
