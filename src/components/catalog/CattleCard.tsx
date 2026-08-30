import Link from 'next/link'
import Image from 'next/image'
import { Status } from '@/types'
import { StatusBadge } from './CattleStatusBadge'
import { formatCurrency, formatWeight } from '@/lib/utils/formatters'

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
  onClick?: () => void
}

export function CattleCard({
  code,
  name,
  breed,
  status,
  price,
  lastWeight,
  mainImage,
  quantity = 1,
  onClick,
}: CattleCardProps) {
  const isSold = status === 'SOLD'
  const isBooked = status === 'BOOKED'
  const isAvailable = status === 'AVAILABLE' && quantity > 0

  return (
    <article
      className={`cow-card min-w-[180px] rounded-lg border border-[hsl(var(--line))] bg-white shadow-card lg:min-w-0 ${isSold || isBooked ? 'opacity-75' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {/* Image Container - Fixed aspect ratio */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
        {mainImage ? (
          <>
            <Image
              src={mainImage}
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
        {/* Quantity Badge */}
        {quantity > 0 && (
          <div className="absolute right-2 top-2 rounded-full bg-[hsl(var(--forest))] px-2 py-0.5 text-[9px] font-bold text-white">
            Stok: {quantity}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="text-[12px] font-bold text-[hsl(var(--forest))] truncate">{name}</h4>
        <p className="mt-0.5 text-[9px] text-[hsl(var(--forest))/60]">
          {code} • {breed}
        </p>

        {/* Weight */}
        <p className="mt-1 text-[10px] text-[hsl(var(--forest))/70]">
          Bobot: <span className="font-semibold">{formatWeight(lastWeight)}</span>
        </p>

        {/* Price */}
        <div className="mt-2 text-[13px] font-extrabold text-[hsl(var(--forest))]">
          {formatCurrency(price)}
        </div>

        {/* Action Button */}
        {isSold || isBooked ? (
          <button
            disabled
            className="open-detail mt-2 w-full cursor-not-allowed rounded-md border border-[hsl(var(--line))] bg-gray-100 px-3 py-2 text-[10px] font-semibold text-gray-400"
          >
            Tidak Tersedia
          </button>
        ) : quantity === 0 ? (
          <button
            disabled
            className="open-detail mt-2 w-full cursor-not-allowed rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-400"
          >
            Stok Habis
          </button>
        ) : (
          <Link
            href={`/sapi/${code}`}
            className="open-detail mt-2 flex w-full items-center justify-center rounded-md bg-[hsl(var(--forest))] px-3 py-2 text-[10px] font-bold text-white hover:bg-[hsl(var(--forest2))] transition-colors"
          >
            Lihat Detail
          </Link>
        )}
      </div>
    </article>
  )
}
