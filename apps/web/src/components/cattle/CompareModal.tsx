'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { CattleWithRelations } from '@samadya/shared/types'
import { formatCurrency, formatWeight } from '@samadya/shared/lib/utils/formatters'
import { getDirectImageUrl, isVideoUrl } from '@samadya/shared/lib/utils/imageUrl'
import { cn } from '@samadya/shared/lib/utils/cn'
import { WeightChart } from '@samadya/shared/components/weight/WeightChart'

interface CompareModalProps {
  cattle: CattleWithRelations[]
  onClose: () => void
  onRemove: (id: string) => void
}

export function CompareModal({ cattle, onClose, onRemove }: CompareModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (cattle.length === 0) return null

  const current = cattle[currentIndex]
  const hasMultiple = cattle.length > 1

  const fields: { label: string; getValue: (c: CattleWithRelations) => string | number | null }[] = [
    { label: 'Kode', getValue: c => c.code },
    { label: 'Nama', getValue: c => c.name },
    { label: 'Jenis Kelamin', getValue: c => c.gender ?? '-' },
    { label: 'Ras', getValue: c => c.breed },
    { label: 'Usia', getValue: c => c.age ?? '-' },
    { label: 'Bobot Sekarang', getValue: c => c.lastWeight ? formatWeight(c.lastWeight) : '-' },
    { label: 'ADG', getValue: c => c.avgDailyGain ? `${c.avgDailyGain.toFixed(2)} kg` : '-' },
    { label: 'Harga', getValue: c => formatCurrency(Number(c.price)) },
    { label: 'Status', getValue: c => c.status },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-5xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[hsl(var(--line))] px-5 py-4">
          <h2 className="text-[18px] font-bold text-[hsl(var(--forest))]">Bandingkan Sapi</h2>
          <div className="flex items-center gap-3">
            {hasMultiple && (
              <span className="text-[11px] text-[hsl(var(--forest))/60]">{currentIndex + 1} / {cattle.length}</span>
            )}
            <button onClick={onClose} className="rounded-full p-1 hover:bg-[hsl(var(--cream))]">
              <X className="h-5 w-5 text-[hsl(var(--forest))]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {cattle.map((c, idx) => (
            <div
              key={c.id}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'cursor-pointer border-b border-r border-[hsl(var(--line))] p-4 transition-colors md:border-b-0',
                idx === currentIndex ? 'bg-[hsl(var(--cream))]' : 'hover:bg-[hsl(var(--cream))]/50'
              )}
            >
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg">
                {c.mainImage && !isVideoUrl(c.mainImage) ? (
                  <Image src={getDirectImageUrl(c.mainImage)} alt={c.name} fill className="object-cover" sizes="300px" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[hsl(var(--cream))] text-[10px] text-[hsl(var(--forest))/50]">Tidak Ada Foto</div>
                )}
              </div>
              <h3 className="text-[13px] font-bold text-[hsl(var(--forest))]">{c.name}</h3>
              <p className="text-[10px] text-[hsl(var(--forest))/55]">{c.code}</p>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(c.id) }}
                className="mt-2 text-[9px] text-red-500 hover:underline"
              >
                Hapus dari bandingkan
              </button>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto border-t border-[hsl(var(--line))]">
          <table className="w-full min-w-[600px] text-[11px]">
            <tbody>
              {fields.map((field, idx) => (
                <tr key={field.label} className={idx % 2 === 0 ? 'bg-white' : 'bg-[hsl(var(--cream))]/50'}>
                  <td className="border-b border-r border-[hsl(var(--line))] px-4 py-2.5 font-semibold text-[hsl(var(--forest))/60]">{field.label}</td>
                  {cattle.map(c => (
                    <td key={c.id} className="border-b border-r border-[hsl(var(--line))] px-4 py-2.5 font-medium text-[hsl(var(--forest))]">
                      {String(field.getValue(c))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMultiple && (
          <div className="flex items-center justify-center gap-4 border-t border-[hsl(var(--line))] p-3">
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="rounded-md border border-[hsl(var(--line))] p-2 hover:bg-[hsl(var(--cream))] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-semibold text-[hsl(var(--forest))]">
              {current.name} ({current.code})
            </span>
            <button
              onClick={() => setCurrentIndex(i => Math.min(cattle.length - 1, i + 1))}
              disabled={currentIndex === cattle.length - 1}
              className="rounded-md border border-[hsl(var(--line))] p-2 hover:bg-[hsl(var(--cream))] disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
