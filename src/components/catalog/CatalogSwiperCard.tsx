'use client'

import Image from 'next/image'
import { formatCurrency, formatWeight } from '@/lib/utils/formatters'
import { Status } from '@/types'

interface CatalogSwiperCardProps {
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
  onClick?: () => void
}

export function CatalogSwiperCard({
  code, name, breed, status, price, lastWeight, mainImage, quantity = 1,
  isSelected = false, onClick
}: CatalogSwiperCardProps) {
  const isSold = status === 'SOLD'
  const isBooked = status === 'BOOKED'
  const isAvailable = status === 'AVAILABLE' && quantity > 0

  return (
    <article
      onClick={onClick}
      className={`
        flex-shrink-0 w-[200px] sm:w-[280px] rounded-lg border bg-white shadow-card
        transition-all duration-200 cursor-pointer
        ${isSelected
          ? 'border-[hsl(var(--forest))] ring-2 ring-[hsl(var(--forest))]'
          : 'border-[hsl(var(--line))] hover:border-[hsl(var(--forest))]'}
        ${isSold || isBooked ? 'opacity-75' : ''}
      `}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
        {mainImage ? (
          <>
            <Image src={mainImage} alt={name} fill className="object-cover" sizes="280px" />
            {(isSold || isBooked) && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isSold ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
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
        {quantity > 0 && !isSold && !isBooked && (
          <div className="absolute right-2 top-2 rounded-full bg-[hsl(var(--forest))] px-2 py-0.5 text-[9px] font-bold text-white">
            Stok: {quantity}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="text-[12px] font-bold text-[hsl(var(--forest))] truncate">{name}</h4>
        <p className="mt-0.5 text-[9px] text-[hsl(var(--forest))/60]">{code} - {breed}</p>
        <p className="mt-1 text-[10px] text-[hsl(var(--forest))/70]">
          Bobot: <span className="font-semibold">{formatWeight(lastWeight)}</span>
        </p>
        <div className="mt-2 text-[13px] font-extrabold text-[hsl(var(--forest))]">
          {formatCurrency(price)}
        </div>
      </div>
    </article>
  )
}
