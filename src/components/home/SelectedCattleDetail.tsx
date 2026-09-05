'use client'

import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import { CattleWithRelations } from '@/types'
import { StatusBadge } from '@/components/catalog/CattleStatusBadge'
import { formatWeight, formatDate } from '@/lib/utils/formatters'
import { getDirectImageUrl, isVideoUrl } from '@/lib/utils/imageUrl'
import { ScanLine, Columns3, Check, Film } from 'lucide-react'

interface SelectedCattleDetailProps {
  cattle: CattleWithRelations | null
  onCompare?: () => void
  isComparing?: boolean
}

export function SelectedCattleDetail({
  cattle,
  onCompare,
  isComparing = false
}: SelectedCattleDetailProps) {
  if (!cattle) {
    return (
      <div className="h-full min-h-[350px] w-full rounded-xl border border-dashed border-[hsl(var(--line))] bg-[hsl(var(--cream))]/50 flex flex-col items-center justify-center p-6 text-center">
        <img src="/images/cow-seeklogo.png" alt="Sapi" className="w-16 h-16 mb-3 opacity-50" />
        <h3 className="text-sm font-semibold text-[hsl(var(--forest))]">Pilih Sapi</h3>
        <p className="text-xs text-[hsl(var(--forest))/60] mt-1">
          Pilih sapi dari katalog untuk melihat detail perkembangan
        </p>
      </div>
    )
  }

  // Sort weights by date ascending
  const sortedWeights = [...(cattle.weights || [])].sort(
    (a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
  )
  const firstWeight = sortedWeights[0]?.weight
  const birthDate = cattle.birthDate ? new Date(cattle.birthDate) : null

  const qrUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/sapi/${cattle.code}`
      : `/sapi/${cattle.code}`

  return (
    <div className="flex h-full w-full flex-col justify-between gap-4">
      {/* Upper Section: Cattle Information */}
      <div className="rounded-xl border border-[hsl(var(--line))] bg-[hsl(var(--cream))]/40 p-4 shadow-xs">
        {/* Profile Header (Photo & Title) */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-16/10 w-full overflow-hidden rounded-lg bg-[hsl(var(--cream))] border border-[hsl(var(--line))]">
            {cattle.mainImage && !isVideoUrl(cattle.mainImage) ? (
              <Image
                src={getDirectImageUrl(cattle.mainImage)}
                alt={cattle.name}
                fill
                className="object-cover"
              />
            ) : cattle.mainImage && isVideoUrl(cattle.mainImage) ? (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-[hsl(var(--forest))/20] to-[hsl(var(--forest))/40]">
                <Film className="h-8 w-8 text-[hsl(var(--forest))/50]" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[hsl(var(--forest))/40] text-xs font-medium">
                Gambar Tidak Tersedia
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-[hsl(var(--forest))] leading-tight">
                {cattle.name}
              </h3>
              <StatusBadge status={cattle.status} />
            </div>

            {/* Cattle Details List */}
            <div className="mt-3 space-y-1.5 text-xs text-[hsl(var(--forest))/80] border-t border-[hsl(var(--line))/60] pt-2.5">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--forest))/60]">Kode Sapi:</span>
                <span className="font-semibold text-[hsl(var(--forest))]">{cattle.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--forest))/60]">Ras / Breed:</span>
                <span className="font-semibold text-[hsl(var(--forest))]">{cattle.breed}</span>
              </div>
              {birthDate && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--forest))/60]">Tanggal Lahir:</span>
                  <span className="font-medium">{formatDate(birthDate)}</span>
                </div>
              )}
              {firstWeight && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--forest))/60]">Berat Awal:</span>
                  <span className="font-medium">{formatWeight(firstWeight)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[hsl(var(--forest))/60]">Lokasi:</span>
                <span className="font-medium">Kandang Utama</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section: QR Code Card & Action Buttons (Terurut ke paling bawah) */}
      <div className="mt-auto rounded-xl border border-[hsl(var(--line))] bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 border-b border-[hsl(var(--line))/50] pb-2.5 mb-3">
          <div>
            <div className="text-xs font-bold text-[hsl(var(--forest))]">QR Detail Sapi</div>
            <div className="text-[11px] text-[hsl(var(--forest))/60]">
              Scan untuk akses cepat
            </div>
          </div>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--cream))] text-[hsl(var(--forest))]">
            <ScanLine className="h-4 w-4" />
          </span>
        </div>

        {/* QR & Info Box */}
        <div className="flex flex-col items-center gap-3">
          <div className="shrink-0 rounded-lg border border-[hsl(var(--line))] bg-white p-2 shadow-xs">
            <QRCodeSVG
              value={qrUrl}
              size={110}
              level="H"
              bgColor="#ffffff"
              fgColor="#111111"
            />
          </div>

          <div className="w-full text-center">
            <p className="text-[11px] text-[hsl(var(--forest))/70] leading-snug mb-3">
              Gunakan kamera ponsel untuk melihat seluruh riwayat perkembangan sapi ini.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <a
                href={`/sapi/${cattle.code}`}
                className="w-full rounded-lg bg-[hsl(var(--forest))] px-3 py-2 text-xs font-semibold text-white text-center transition-all hover:bg-[hsl(var(--forest))/90] shadow-xs"
              >
                Lihat Detail Lengkap
              </a>
              {onCompare && (
                <button
                  onClick={onCompare}
                  className={`w-full rounded-lg border px-3 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isComparing
                      ? 'border-[hsl(var(--forest))] bg-[hsl(var(--forest))] text-white'
                      : 'border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))/50]'
                  }`}
                >
                  {isComparing ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Sedang Dibandingkan
                    </>
                  ) : (
                    <>
                      <Columns3 className="h-3.5 w-3.5" />
                      Bandingkan Sapi
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
}
