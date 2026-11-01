/**
 * Класи стилю «стриманість + інтерактив» — звичайний модуль (не 'use client'),
 * щоб їх можна було використовувати і в серверних, і в клієнтських компонентах.
 */

/** Інтерактивна плитка: світлий фон → білий з тінню при наведенні */
export const tileClass =
  'group rounded-2xl border border-dark/5 bg-dark-50 transition-all duration-300 hover:-translate-y-0.5 hover:border-dark/10 hover:bg-white hover:shadow-[0_12px_30px_rgba(13,27,42,0.08)]'

/** Біла картка, що піднімається при наведенні */
export const cardClass =
  'group rounded-2xl border border-dark/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-dark/15 hover:shadow-[0_18px_40px_rgba(13,27,42,0.10)]'

/** Іконка в білому чипі, що заповнюється кольором при hover батьківського `group` */
export const iconChipClass =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary-500 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white'

/** Іконка-чип для темних секцій */
export const iconChipDarkClass =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-dark'

/** Посилання-кнопка другорядна (outlined → заповнюється темним) */
export const secondaryLinkClass =
  'group inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-dark/15 bg-white px-5 text-sm font-medium text-dark transition-all duration-300 hover:border-dark hover:bg-dark hover:text-white active:scale-[0.98]'

/** Посилання-кнопка основна (темна з підйомом; додайте <Shine /> всередину для відблиску) */
export const primaryLinkClass =
  'group relative inline-flex min-h-[44px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-dark px-6 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(22,24,28,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-dark-700 hover:shadow-[0_14px_36px_rgba(22,24,28,0.26)] active:scale-[0.98]'

/** Заголовок секції: маленький надзаголовок */
export const eyebrowClass = 'text-xs font-medium uppercase tracking-[0.2em] text-dark-400'

/** Поле вводу: м'який сірий фон → білий з тінню при фокусі */
export const fieldClass =
  'w-full rounded-xl border border-dark/5 bg-dark-50 text-sm text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none'
