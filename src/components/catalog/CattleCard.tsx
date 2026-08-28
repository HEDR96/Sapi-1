import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { StatusBadge } from './CattleStatusBadge'
import { formatCurrency, formatWeight } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import { Status } from '@/types'

interface CattleCardProps {
  code: string
  name: string
  breed: string
  status: Status
  price: number
  lastWeight: number | null
  mainImage: string | null
}

export function CattleCard({
  code,
  name,
  breed,
  status,
  price,
  lastWeight,
  mainImage,
}: CattleCardProps) {
  return (
    <Link href={`/sapi/${code}`}>
      <Card className={cn(
        'group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1',
        status === 'SOLD' && 'opacity-90'
      )}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
          <div className="absolute left-3 top-3">
            <StatusBadge status={status} />
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Nama:</p>
            <h3 className="font-semibold text-lg leading-tight">{name}</h3>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Kode</p>
              <p className="font-medium">{code}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Jenis</p>
              <p className="font-medium">{breed}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bobot</p>
              <p className="font-medium">
                {lastWeight ? formatWeight(lastWeight) : '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Harga</p>
              <p className="font-medium text-primary">{formatCurrency(price)}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
            Lihat Detail
            <ArrowRight className="h-4 w-4" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
