'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency, formatWeight } from '@/lib/utils/formatters'
import { StatusBadge } from '@/components/catalog/CattleStatusBadge'
import { CattleWithRelations } from '@/types'

interface SelectedCattleDetailProps {
  cattle: CattleWithRelations | null
}

export function SelectedCattleDetail({ cattle }: SelectedCattleDetailProps) {
  if (!cattle) {
    return (
      <div className="h-full rounded-xl border border-dashed border-[hsl(var(--line))] bg-[hsl(var(--cream))]/50 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-3">🐂</div>
        <h3 className="text-lg font-semibold text-[hsl(var(--forest))]">
          Pilih Sapi
        </h3>
        <p className="text-sm text-[hsl(var(--forest))/60] mt-1">
          Pilih sapi dari katalog di atas untuk melihat detail perkembangan
        </p>
      </div>
    )
  }

  const lastWeight = cattle.weights?.[0]?.weight
  const weightProgress = cattle.targetWeight && lastWeight
    ? Math.min(100, (lastWeight / cattle.targetWeight) * 100)
    : null

  return (
    <div className="h-full rounded-xl border border-[hsl(var(--line))] bg-white overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-[hsl(var(--cream))]">
        {cattle.mainImage ? (
          <Image src={cattle.mainImage} alt={cattle.name} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-[hsl(var(--forest))/30]">
            Tidak ada foto
          </div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={cattle.status} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-[hsl(var(--forest))]">{cattle.name}</h3>
        <p className="text-xs text-[hsl(var(--forest))/60]">{cattle.code} • {cattle.breed}</p>

        <div className="mt-4 space-y-3">
          <div>
            <span className="text-xs text-[hsl(var(--forest))/60]">Harga</span>
            <p className="text-lg font-bold text-[hsl(var(--forest))]">
              {formatCurrency(Number(cattle.price))}
            </p>
          </div>

          <div>
            <span className="text-xs text-[hsl(var(--forest))/60]">Bobot Terakhir</span>
            <p className="text-xl font-bold text-[hsl(var(--forest))]">
              {formatWeight(lastWeight || null)}
            </p>
          </div>

          {cattle.targetWeight && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[hsl(var(--forest))/60]">Target</span>
                <span className="font-medium text-[hsl(var(--forest))]">
                  {formatWeight(cattle.targetWeight)}
                </span>
              </div>
              <div className="h-2 bg-[hsl(var(--cream))] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[hsl(var(--forest))] rounded-full transition-all"
                  style={{ width: `${weightProgress || 0}%` }}
                />
              </div>
              <p className="text-xs text-[hsl(var(--forest))/60] mt-1">
                {weightProgress?.toFixed(0)}% tercapai
              </p>
            </div>
          )}
        </div>

        <Link
          href={`/sapi/${cattle.code}`}
          className="mt-4 block w-full text-center bg-[hsl(var(--forest))] text-white py-2 rounded-lg font-semibold hover:bg-[hsl(var(--forest2))] transition-colors"
        >
          Lihat Detail Lengkap
        </Link>
      </div>
    </div>
  )
}
