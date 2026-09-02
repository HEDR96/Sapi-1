'use client'

import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import { CattleWithRelations } from '@/types'
import { StatusBadge } from '@/components/catalog/CattleStatusBadge'
import { formatWeight, formatCurrency, formatDate } from '@/lib/utils/formatters'
import { getDirectImageUrl } from '@/lib/utils/imageUrl'
import { ScanLine, Columns3, Check } from 'lucide-react'

interface SelectedCattleDetailProps {
  cattle: CattleWithRelations | null
  onCompare?: () => void
  isComparing?: boolean
}

export function SelectedCattleDetail({ cattle, onCompare, isComparing = false }: SelectedCattleDetailProps) {
  if (!cattle) {
    return (
      <div className="h-full rounded-xl border border-dashed border-[hsl(var(--line))] bg-[hsl(var(--cream))]/50 flex flex-col items-center justify-center p-4 text-center min-h-[300px]">
  <Image src="/images/cow-seeklogo.png" alt="Sapi" width={64} height={64} className="mb-2 opacity-60" />
  <h3 className="text-sm font-semibold text-[hsl(var(--forest))]">
    Pilih Sapi
  </h3>
  <p className="text-xs text-[hsl(var(--forest))/60] mt-1">
    Pilih sapi dari katalog untuk melihat detail perkembangan
  </p>
</div>
    )
  }

  // Sort weights by date ascending - handle both string and Date
  const sortedWeights = [...(cattle.weights || [])].sort(
    (a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
  )
  const lastWeight = sortedWeights[sortedWeights.length - 1]?.weight
  const firstWeight = sortedWeights[0]?.weight
  const birthDate = cattle.birthDate ? new Date(cattle.birthDate) : null

  const qrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/sapi/${cattle.code}`
    : `/sapi/${cattle.code}`

  return (
    <div className="space-y-2">
      {/* Cattle Info Card */}
      <div className="rounded-md border border-[hsl(var(--line))] bg-[hsl(var(--cream))]/70 p-2">
        <div className="grid grid-cols-[64px_1fr] gap-2">
          {/* Photo */}
          <div className="h-14 rounded bg-cover bg-center relative">
            {cattle.mainImage ? (
              <Image src={getDirectImageUrl(cattle.mainImage)} alt={cattle.name} fill className="object-cover rounded" />
            ) : (
              <div className="flex items-center justify-center h-full bg-[hsl(var(--cream))] rounded text-[hsl(var(--forest))/30] text-xs">
                N/A
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-[hsl(var(--forest))]">{cattle.name}</span>
              <StatusBadge status={cattle.status} />
            </div>
            <div className="mt-1.5 space-y-1 text-[7px] leading-4 text-[hsl(var(--forest))/70]">
              <div>Kode Sapi: {cattle.code}</div>
              <div>Jenis Sapi: {cattle.breed}</div>
              {birthDate && (
                <div>Tanggal Lahir: {formatDate(birthDate)}</div>
              )}
              {firstWeight && (
                <div>Berat Awal: {formatWeight(firstWeight)}</div>
              )}
              <div>Lokasi: Kandang Utama</div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="mt-2.5 rounded-lg border border-[hsl(var(--line))] bg-white p-2.5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[9px] font-bold text-[hsl(var(--forest))]">QR Detail Sapi</div>
              <div className="mt-1 max-w-[170px] text-[7px] leading-4 text-[hsl(var(--forest))/60]">
                Scan QR untuk membuka halaman detail sapi ini secara langsung.
              </div>
            </div>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[hsl(var(--cream))] text-[hsl(var(--forest))/80]">
              <ScanLine className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-[76px_minmax(0,1fr)] items-start gap-2.5">
            {/* QR Code */}
            <div className="flex justify-start">
              <div className="aspect-square h-[76px] w-[76px] shrink-0 rounded border border-[hsl(var(--line))] bg-white p-1.5 flex items-center justify-center">
                <QRCodeSVG
                  value={qrUrl}
                  size={64}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#111111"
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="grid gap-1 text-[7px] leading-4 text-[hsl(var(--forest))/60]">
                <div className="flex items-start gap-1.5">
                  <span className="mt-0.5 text-[hsl(var(--olive))]">✓</span>
                  <span>Masuk ke profil sapi sesuai kode QR.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="mt-0.5 text-[hsl(var(--olive))]">✓</span>
                  <span>Lihat timbang, kesehatan, pakan, dan dokumentasi.</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <a
                  href={`/sapi/${cattle.code}`}
                  className="w-full rounded-md bg-[hsl(var(--forest))] px-2.5 py-2 text-[8px] font-bold text-white text-center block"
                >
                  Lihat Detail Lengkap
                </a>
                {onCompare && (
                  <button
                    onClick={onCompare}
                    className={`flex-1 rounded-md border px-2.5 py-2 text-[8px] font-semibold flex items-center justify-center gap-1 ${
                      isComparing
                        ? 'border-[hsl(var(--forest))] bg-[hsl(var(--forest))] text-white'
                        : 'border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))]'
                    }`}
                  >
                    {isComparing ? (
                      <>
                        <Check className="h-3 w-3" />
                        Dipilih
                      </>
                    ) : (
                      <>
                        <Columns3 className="h-3 w-3" />
                        Bandingkan
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
