'use client'

import { formatCurrency } from '@samadya/shared/lib/utils/formatters'

interface PriceAndActionProps {
  price: number
  status: string
  onBuyNow?: () => void
  onBooking?: () => void
}

export function PriceAndAction({ price, status, onBuyNow, onBooking }: PriceAndActionProps) {
  const isAvailable = status === 'AVAILABLE'
  const isBooked = status === 'BOOKED'
  const isSold = status === 'SOLD'

  return (
    <div className="rounded-xl border border-[hsl(var(--line))] bg-white p-5 shadow-card">
      <div className="mb-4">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--forest))/60]">Harga</div>
        <div className="text-[28px] font-extrabold text-[hsl(var(--forest))]">{formatCurrency(price)}</div>
        <div className="text-[9px] text-[hsl(var(--forest))/50]">* Harga dapat berubah sewaktu-waktu</div>
      </div>

      {isSold ? (
        <button disabled className="w-full rounded-md bg-gray-200 px-4 py-3 text-[11px] font-bold text-gray-400 cursor-not-allowed">
          Sapi Sudah Terjual
        </button>
      ) : isBooked ? (
        <button disabled className="w-full rounded-md bg-amber-200 px-4 py-3 text-[11px] font-bold text-amber-700 cursor-not-allowed">
          Sedang Dibooking
        </button>
      ) : isAvailable ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={onBuyNow}
            className="w-full rounded-md bg-[hsl(var(--forest))] px-4 py-3 text-[11px] font-bold text-white hover:bg-[hsl(var(--forest2))] transition-colors"
          >
            Booking Sekarang
          </button>
          <button
            onClick={onBooking}
            className="w-full rounded-md border border-[hsl(var(--forest))] px-4 py-3 text-[11px] font-bold text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))] transition-colors"
          >
            Konsultasi Dulu
          </button>
        </div>
      ) : (
        <button disabled className="w-full rounded-md bg-gray-200 px-4 py-3 text-[11px] font-bold text-gray-400 cursor-not-allowed">
          Tidak Tersedia
        </button>
      )}
    </div>
  )
}
