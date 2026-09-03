'use client'

import { ShieldCheck, Clock3, ClipboardList, BadgeCheck } from 'lucide-react'

interface TrustSectionProps {
  name: string
  code: string
}

const trustItems = [
  {
    icon: ShieldCheck,
    title: 'Sesuai Syariat',
    description: 'Proses qurban berjalan sesuai tuntunan agama.',
  },
  {
    icon: Clock3,
    title: 'Monitoring Berkala',
    description: 'Bobot dan kesehatan sapi dipantau setiap minggu.',
  },
  {
    icon: ClipboardList,
    title: 'Laporan Transparan',
    description: 'Anda menerima laporan perkembangan sapi secara berkala.',
  },
  {
    icon: BadgeCheck,
    title: 'Garansi Kesehatan',
    description: 'Sapi yang sakit atau tidak layak akan diganti atau dikembalikan dananya.',
  },
]

export function TrustSection({ name, code }: TrustSectionProps) {
  return (
    <div className="rounded-xl border border-[hsl(var(--line))] bg-[#FCFAF4] p-5 shadow-card">
      <h3 className="text-[13px] font-bold text-[hsl(var(--forest))]">Komitmen samadyafarm.id</h3>
      <p className="mt-1 text-[9px] text-[hsl(var(--forest))/60]">
        Untuk sapi <strong>{name}</strong> ({code})
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {trustItems.map((item, index) => (
          <div key={index} className="flex items-start gap-2.5 rounded-lg border border-[hsl(var(--line))] bg-white p-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[hsl(var(--line))] bg-[hsl(var(--cream))] text-[hsl(var(--olive))]">
              <item.icon className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-[11px] font-bold text-[hsl(var(--forest))]">{item.title}</h4>
              <p className="mt-0.5 text-[9px] leading-4 text-[hsl(var(--forest))/60]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
