import { Metadata } from 'next'
import { AboutHero } from '../../components/sections/about-hero'
import { OurStory } from '../../components/sections/our-story'
import { QualityStandards } from '../../components/sections/quality-standards'
import { Certifications } from '../../components/sections/certifications'
import { ContactCTA } from '../../components/sections/contact-cta'

export const metadata: Metadata = {
  title: 'Про нас | Валігура',
  description: 'Дізнайтеся про Валігура — HACCP-сертифікованого виробника копченої, пряної та мороженої риби в Хмільнику.',
  keywords: 'про компанію, Валігура, HACCP, якість, копчена риба, пряна риба, Хмільник',
  openGraph: {
    title: 'Про нас | Валігура',
    description: 'Виробник натуральної копченої, пряної та мороженої риби з Хмільника.',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <main className="overflow-hidden">
      <AboutHero />
      <OurStory />
      <QualityStandards />
      <Certifications />
      <ContactCTA />
    </main>
  )
}