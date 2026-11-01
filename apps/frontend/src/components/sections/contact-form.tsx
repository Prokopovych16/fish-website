'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import api from '@/lib/api'

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await api.post('/contact', formData)
      setIsSubmitted(true)
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      }, 5000)
    } catch (e: any) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg[0] : msg || 'Сталася помилка. Спробуйте ще раз або зв\'яжіться з нами напряму.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-400">Напишіть нам</p>
          <h2 className="mt-4 text-3xl font-semibold text-dark sm:text-4xl">
            Маєте питання? Ми допоможемо!
          </h2>
          <p className="mt-4 text-base leading-7 text-dark-500">
            Заповніть форму нижче, і ми зв'яжемося з вами протягом 24 годин.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-xl bg-surface p-8 md:p-12"
        >
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage-50">
                <CheckCircle className="h-8 w-8 text-sage-600" />
              </div>
              <h3 className="text-2xl font-semibold text-dark mb-2">Дякуємо за повідомлення!</h3>
              <p className="text-dark-500">Ми отримали ваше повідомлення і зв'яжемося з вами найближчим часом.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-dark-600 mb-2">
                    Ім'я *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-dark/5 bg-dark-50 text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none"
                    placeholder="Введіть ваше ім'я"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-600 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-dark/5 bg-dark-50 text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-dark-600 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-dark/5 bg-dark-50 text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none"
                    placeholder="+38 (050) 123-45-67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-600 mb-2">
                    Тема *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-dark/5 bg-dark-50 text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none"
                  >
                    <option value="">Оберіть тему</option>
                    <option value="order">Замовлення товару</option>
                    <option value="wholesale">Оптові поставки</option>
                    <option value="delivery">Доставка</option>
                    <option value="quality">Якість продукції</option>
                    <option value="other">Інше</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-600 mb-2">
                  Повідомлення *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-dark/5 bg-dark-50 text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none resize-none"
                  placeholder="Опишіть ваше питання або замовлення..."
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Надсилаємо...
                    </>
                  ) : (
                    <>
                      Надіслати повідомлення
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
