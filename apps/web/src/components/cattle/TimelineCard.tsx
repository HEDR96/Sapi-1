'use client'

import { CheckCircle2 } from 'lucide-react'

interface TimelineEvent {
  date: string
  title: string
  description?: string
}

interface TimelineCardProps {
  events: TimelineEvent[]
}

export function TimelineCard({ events }: TimelineCardProps) {
  return (
    <div className="rounded-xl border border-[hsl(var(--line))] bg-white p-5 shadow-card">
      <h3 className="mb-4 text-[13px] font-bold text-[hsl(var(--forest))]">Riwayat & Milestone</h3>

      <div className="relative">
        <div className="absolute left-[9px] top-2 h-[calc(100%-16px)] w-px bg-[hsl(var(--line))]" />

        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="relative flex gap-3 pl-0">
              <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-[hsl(var(--olive))]" />
              </div>
              <div className="pt-0.5">
                <div className="text-[9px] font-semibold text-[hsl(var(--forest))/55]">
                  {new Date(event.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div className="text-[11px] font-bold text-[hsl(var(--forest))]">{event.title}</div>
                {event.description && (
                  <p className="mt-0.5 text-[9px] text-[hsl(var(--forest))/60]">{event.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
