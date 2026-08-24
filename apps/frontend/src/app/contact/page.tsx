'use client'

import { ContactHero } from '../../components/sections/contact-hero'
import { ContactForm } from '../../components/sections/contact-form'
import { ContactInfo } from '../../components/sections/contact-info'
import { MapSection } from '../../components/sections/map-section'

export default function ContactPage() {
  return (
    <main className="overflow-hidden">
      <ContactHero />
      <ContactForm />
      <ContactInfo />
      <MapSection />
    </main>
  )
}