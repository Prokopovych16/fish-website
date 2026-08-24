import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Контакти | Валігура',
  description: 'Зв\'яжіться з Валігура для замовлення копченої, пряної та мороженої риби. Телефон, email та адреса в Хмільнику.',
  keywords: 'контакти, телефон, email, адреса, карта, Хмільник',
  openGraph: {
    title: 'Контакти | Валігура',
    description: 'Зв\'яжіться з нами для замовлення свіжої рибної продукції.',
    type: 'website',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}