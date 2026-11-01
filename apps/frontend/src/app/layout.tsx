import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '../components/site-header'
import { SiteFooter } from '../components/site-footer'
import { AuthInitializer } from '../components/auth-initializer'
import { TrackingScripts } from '../components/tracking-scripts'
import { ServiceWorkerRegistrar } from '../components/service-worker-registrar'
import { FloatingContactButton } from '../components/floating-contact-button'

async function getTrackingSettings() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${apiUrl}/settings`, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const settings: { key: string; value: string }[] = await res.json();
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return map;
  } catch {
    return {};
  }
}

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans' })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Валігура — копчена, пряна та морожена риба з доставкою по Україні',
    template: '%s | Валігура',
  },
  description: 'Натуральна копчена, пряна та морожена риба від HACCP-сертифікованого виробника в Хмільнику. Замовляйте онлайн — доставка Новою Поштою по всій Україні.',
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    siteName: 'Валігура',
  },
  twitter: { card: 'summary_large_image' },
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icons/favicon.png', type: 'image/png' }],
    shortcut: '/icons/favicon.png',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Рибний магазин',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#142B42',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getTrackingSettings();
  return (
    <html lang="uk-UA" className={inter.variable}>
      <body className="font-sans antialiased bg-surface text-dark">
        <TrackingScripts
          fbPixelId={settings['fb_pixel_id'] || undefined}
          gtmId={settings['gtm_id'] || undefined}
          ga4Id={settings['ga4_measurement_id'] || undefined}
        />
        <AuthInitializer />
        <SiteHeader />
        <div className="min-h-screen">
          {children}
        </div>
        <SiteFooter />
        <FloatingContactButton />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
