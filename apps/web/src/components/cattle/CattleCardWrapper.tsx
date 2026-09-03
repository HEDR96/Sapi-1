import Link from 'next/link'
import Image from 'next/image'
import { Columns3, Check, Film } from 'lucide-react'
import { Status } from '@samadya/shared/types'
import { formatCurrency, formatWeight } from '@samadya/shared/lib/utils/formatters'
import { getDirectImageUrl, isVideoUrl } from '@samadya/shared/lib/utils/imageUrl'

interface CattleCardWrapperProps {
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

export function CattleCardWrapper({
  id, code, name, breed, status, price, lastWeight, mainImage,
  quantity = 1, isSelected = false, isComparing = false, onClick, onCompare,
}: CattleCardWrapperProps) {
  const isSold = status === 'SOLD'
  const isBooked = status === 'BOOKED'

  return (
    <article
      className={`catalog-card-v2 min-w-[180px] rounded-lg border bg-white shadow-card lg:min-w-0 overflow-hidden ${
        isSold || isBooked ? 'opacity-75' : ''
      } ${isSelected ? 'border-[hsl(var(--gold))] ring-2 ring-[hsl(var(--gold))]' : 'border-[hsl(var(--line))]'}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
        {mainImage && !isVideoUrl(mainImage) ? (
          <Image src={getDirectImageUrl(mainImage)} alt={name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : mainImage && isVideoUrl(mainImage) ? (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[hsl(var(--forest))/20] to-[hsl(var(--forest))/40]">
            <Film className="h-8 w-8 text-[hsl(var(--forest))/50]" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center bg-[hsl(var(--cream))]">
            <span className="text-[10px] text-[hsl(var(--forest))/50]">Tidak Ada Foto</span>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h4 className="text-[11px] font-bold text-[hsl(var(--forest))] truncate">{name}</h4>
        <p className="text-[8px] text-[hsl(var(--forest))/55] truncate">{code} - {breed}</p>
        <div className="mt-1 text-[11px] font-extrabold text-[hsl(var(--forest))]">{formatCurrency(price)}</div>
        <div className="mt-2 flex gap-1.5">
          <Link href={`/sapi/${code}`} className="flex-1 rounded-md bg-[hsl(var(--forest))] px-2 py-2 text-center text-[8px] font-bold text-white">Detail</Link>
          {onCompare && (
            <button onClick={(e) => { e.stopPropagation(); onCompare() }}
              className={`flex items-center gap-1 rounded-md border px-2 py-2 text-[8px] font-bold ${
                isComparing ? 'border-[hsl(var(--forest))] bg-[hsl(var(--forest))] text-white' : 'border-[hsl(var(--line))] text-[hsl(var(--forest))]'
              }`}>
              {isComparing ? <Check className="h-3 w-3" /> : <Columns3 className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
