'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, type HTMLMotionProps } from 'framer-motion'
import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'
import { iconChipClass } from '@/lib/ui-classes'

/**
 * Спільні примітиви стилю «стриманість + інтерактив».
 * Нейтральна палітра (dark / primary / sage), м'які hover-підйоми, появa при скролі.
 */

interface RevealProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  /** Порядковий номер у групі — для каскадної затримки */
  index?: number
  delay?: number
}

/** Плавна поява блоку при прокрутці (fade + slide 12px) */
export function Reveal({ children, index = 0, delay = 0, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: delay + index * 0.05, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Іконка в білому чипі, що заповнюється кольором при hover батьківського `group` (тільки з клієнтських компонентів) */
export function IconChip({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <div className={clsx(iconChipClass, className)}>
      <Icon className="h-5 w-5" />
    </div>
  )
}

/** Пульсуюча крапка статусу (наявність, онлайн, активна акція) */
export function LiveDot({ tone = 'sage' }: { tone?: 'sage' | 'orange' | 'red' }) {
  const color = tone === 'orange' ? 'bg-orange-400' : tone === 'red' ? 'bg-red-500' : 'bg-sage'
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className={clsx('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', color)} />
      <span className={clsx('relative inline-flex h-2 w-2 rounded-full', color)} />
    </span>
  )
}

/**
 * Відблиск, що пробігає по кнопці при hover.
 * Батьківська кнопка: `group relative overflow-hidden` (або `group/btn`, якщо кнопка всередині іншого `group`, → scope="btn")
 */
export function Shine({ scope }: { scope?: 'btn' }) {
  return (
    <span
      className={clsx(
        'pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20 transition-all duration-700',
        scope === 'btn' ? 'group-hover/btn:left-[120%]' : 'group-hover:left-[120%]',
      )}
    />
  )
}

interface SegmentedProps<T extends string> {
  options: { value: T; label: ReactNode }[]
  value: T
  onChange: (value: T) => void
  /** Унікальний id для анімації "пігулки" — різний для кожного перемикача на сторінці */
  layoutId: string
  className?: string
}

/** Сегментований перемикач з анімованою "пігулкою" */
export function Segmented<T extends string>({ options, value, onChange, layoutId, className }: SegmentedProps<T>) {
  return (
    <div className={clsx('inline-flex rounded-full bg-dark-100 p-1 text-xs font-medium', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className="relative min-h-[36px] rounded-full px-3.5 transition-colors duration-200"
        >
          {value === o.value && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-full bg-white shadow-sm"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <span className={clsx('relative', value === o.value ? 'text-dark' : 'text-dark-500 hover:text-dark')}>
            {o.label}
          </span>
        </button>
      ))}
    </div>
  )
}

/** Число, що "набігає" від 0 до значення, коли з'являється на екрані */
export function CountUp({ to, suffix = '', duration = 1.4 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, { duration, ease: 'easeOut', onUpdate: (v) => setValue(Math.round(v)) })
    return () => controls.stop()
  }, [inView, to, duration])

  return (
    <span ref={ref}>
      {value.toLocaleString('uk-UA')}
      {suffix}
    </span>
  )
}

/** Перевірки пароля: перші три обов'язкові на бекенді, спецсимвол — бонус до надійності */
const PASSWORD_RULES = [
  { label: '8+ символів', test: (p: string) => p.length >= 8 },
  { label: 'Велика літера', test: (p: string) => /[A-ZА-ЯІЇЄҐ]/.test(p) },
  { label: 'Цифра', test: (p: string) => /\d/.test(p) },
  { label: 'Спецсимвол', test: (p: string) => /[^A-Za-zА-Яа-яІіЇїЄєҐґ0-9]/.test(p) },
]

/** Індикатор надійності пароля: 4 сегменти + чек-лист правил */
export function PasswordStrength({ password }: { password: string }) {
  const passed = PASSWORD_RULES.map((r) => r.test(password))
  const score = passed.filter(Boolean).length
  const color = score <= 1 ? 'bg-red-400' : score === 2 ? 'bg-orange-400' : score === 3 ? 'bg-primary-400' : 'bg-sage'
  const label = ['Дуже слабкий', 'Слабкий', 'Середній', 'Добрий', 'Надійний'][score]

  if (!password) return null

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 overflow-hidden">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-dark-100">
            <motion.div
              className={clsx('h-full rounded-full', color)}
              initial={false}
              animate={{ width: i < score ? '100%' : '0%' }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="font-medium text-dark">{label}</span>
        {PASSWORD_RULES.map((r, i) => (
          <span key={r.label} className={clsx('transition-colors duration-300', passed[i] ? 'text-sage-600' : 'text-dark-400')}>
            {passed[i] ? '✓' : '·'} {r.label}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
