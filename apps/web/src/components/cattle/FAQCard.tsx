'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@samadya/shared/lib/utils/cn'

interface FAQItem {
  question: string
  answer: string
}

interface FAQCardProps {
  items?: FAQItem[]
}

const defaultFAQs: FAQItem[] = [
  {
    question: 'Bagaimana cara memantau perkembangan sapi?',
    answer: 'Anda bisa memantau perkembangan sapi melalui halaman profil masing-masing sapi yang dilengkapi dengan data bobot, kesehatan, dan laporan berkala.',
  },
  {
    question: 'Apakah bisa memilih sapi langsung?',
    answer: 'Ya, Anda bisa memilih sapi yang diinginkan dan langsung berkomunikasi dengan tim kami via WhatsApp untuk proses booking.',
  },
  {
    question: 'Bagaimana jika sapi sakit atau tidak layak qurban?',
    answer: 'Sapi yang sakit atau tidak layak qurban akan diganti atau dananya dikembalikan sepenuhnya. Ini adalah komitmen kami.',
  },
  {
    question: 'Apakah tersedia pengiriman?',
    answer: 'Ya, kami menyediakan layanan pengiriman sapi ke lokasi Anda menjelang hari raya qurban.',
  },
]

export function FAQCard({ items = defaultFAQs }: FAQCardProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="rounded-xl border border-[hsl(var(--line))] bg-white p-5 shadow-card">
      <h3 className="mb-4 text-[13px] font-bold text-[hsl(var(--forest))]">Pertanyaan Umum</h3>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-[hsl(var(--line))]">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-[11px] font-semibold text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))] transition-colors"
            >
              {item.question}
              <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', openIndex === index && 'rotate-180')} />
            </button>
            {openIndex === index && (
              <div className="border-t border-[hsl(var(--line))] px-4 py-3 text-[10px] leading-5 text-[hsl(var(--forest))/70]">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
