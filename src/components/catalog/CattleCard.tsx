import Link from 'next/link'
import Image from 'next/image'
import { Columns3, Check } from 'lucide-react'
import { Status } from '@/types'
import { StatusBadge } from './CattleStatusBadge'
import { formatCurrency, formatWeight } from '@/lib/utils/formatters'
import { getDirectImageUrl } from '@/lib/utils/imageUrl'

interface CattleCardProps {
  id: string
  code: string
  name: string
  breed: string
  status: Status
  price: number
  lastWeight: number | null
  mainImage: string | null
  quantity?: number
  isSelected?: boolean
  isComparing?: boolean
  onClick?: () => void
  onCompare?: () => void
}

export function CattleCard({
  id,
  code,
  name,
  breed,
  status,
  price,
  lastWeight,
  mainImage,
  quantity = 1,
  isSelected = false,
  isComparing = false,
  onClick,
  onCompare,
}: CattleCardProps) {
  const isSold = status === 'SOLD'
  const isBooked = status === 'BOOKED'
  const isAvailable = status === 'AVAILABLE' && quantity > 0

  return (
    <article
      className={`catalog-card-v2 min-w-[180px] rounded-lg border bg-white shadow-card lg:min-w-0 overflow-hidden ${
        isSold || isBooked ? 'opacity-75' : ''
      } ${isSelected ? 'border-[hsl(var(--gold))] ring-2 ring-[hsl(var(--gold))]' : 'border-[hsl(var(--line))]'}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
        {mainImage ? (
          <>
            <Image
              src={getDirectImageUrl(mainImage)}
              alt={name}
              fill
              className={`object-cover transition-transform duration-300 ${
                isSold ? 'brightness-50 grayscale' : 'group-hover:scale-105'
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Sold/Booked Overlay */}
            {(isSold || isBooked) && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <span className={`rounded-full px-4 py-2 text-sm font-bold ${
                  isSold
                    ? 'bg-red-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {isSold ? 'TERJUAL' : 'DIBOOKING'}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-[hsl(var(--cream))]">
            <span className="text-[10px] text-[hsl(var(--forest))/50]">Tidak Ada Foto</span>
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute left-2 top-2">
          <StatusBadge status={status} />
        </div>
        {/* Progress Score Badge */}
        {lastWeight && (
          <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[7px] font-bold text-[hsl(var(--forest))] shadow-sm">
            85%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5">
        {/* Header with Compare Button */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-[11px] font-bold text-[hsl(var(--forest))] truncate">{name}</h4>
            <p className="mt-0.5 text-[8px] text-[hsl(var(--forest))/55] truncate">
              {code} • {breed}
            </p>
          </div>
          {onCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCompare()
              }}
              className={`compare-toggle flex shrink-0 items-center gap-1 rounded-md border px-2 py-1.5 text-[7px] font-bold ${
                isComparing
                  ? 'border-[hsl(var(--forest))] bg-[hsl(var(--forest))] text-white'
                  : 'border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))]'
              }`}
              title="Pilih untuk dibandingkan"
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

        {/* Weight and ADG Grid */}
        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[8px]">
          <div className="rounded bg-[hsl(var(--cream))] px-2 py-1.5">
            <span className="text-[hsl(var(--forest))/45]">Bobot</span>
            <div className="font-bold text-[hsl(var(--forest))]">{formatWeight(lastWeight)}</div>
          </div>
          <div className="rounded bg-[hsl(var(--cream))] px-2 py-1.5">
            <span className="text-[hsl(var(--forest))/45]">ADG</span>
            <div className="font-bold text-[hsl(var(--forest))]">1.05 kg</div>
          </div>
        </div>

        {/* Price */}
        <div className="mt-2 text-[11px] font-extrabold text-[hsl(var(--forest))]">
          {formatCurrency(price)}
        </div>

        {/* Action Buttons */}
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {isSold || isBooked ? (
            <>
              <button
                disabled
                className="col-span-2 cursor-not-allowed rounded-md bg-gray-100 px-2 py-2 text-[8px] font-semibold text-gray-400"
              >
                Tidak Tersedia
              </button>
            </>
          ) : quantity === 0 ? (
            <>
              <button
                disabled
                className="col-span-2 cursor-not-allowed rounded-md border border-red-200 bg-red-50 px-2 py-2 text-[8px] font-semibold text-red-400"
              >
                Stok Habis
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/sapi/${code}`}
                onClick={(e) => e.stopPropagation()}
                className="rounded-md bg-[hsl(var(--forest))] px-2 py-2 text-center text-[8px] font-bold text-white hover:bg-[hsl(var(--forest2))] transition-colors"
              >
                Detail
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCompare?.()
                }}
                className={`rounded-md border px-2 py-2 text-center text-[8px] font-semibold transition-colors ${
                  isComparing
                    ? 'border-[hsl(var(--forest))] bg-[hsl(var(--forest))] text-white'
                    : 'border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))]'
                }`}
              >
                {isComparing ? 'Dipilih' : 'Bandingkan'}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
