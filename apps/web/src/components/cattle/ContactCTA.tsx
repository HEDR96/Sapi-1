'use client'

import { MessageCircle } from 'lucide-react'

interface ContactCTAProps {
  name: string
  price: number
  code: string
}

export function ContactCTA({ name, price, code }: ContactCTAProps) {
  const message = `Halo admin, saya tertarik dengan sapi ${name} (${code}) yang seharga.`
  const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`

  return (
    <div className="rounded-xl border border-[hsl(var(--line))] bg-white p-4 shadow-card">
      <h3 className="text-[14px] font-bold text-[hsl(var(--forest))]">Tertarik dengan Sapi Ini?</h3>
      <p className="mt-1 text-[10px] text-[hsl(var(--forest))/65]">
        Hubungi kami via WhatsApp untuk konsultasi atau booking sapi ini.
      </p>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#20BA56] transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        Hubungi via WhatsApp
      </a>
    </div>
  )
}
