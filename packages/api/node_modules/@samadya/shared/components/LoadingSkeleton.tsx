export function CattleCardSkeleton() {
  return (
    <div className="cow-card rounded-lg border border-[hsl(var(--line))] bg-white shadow-card overflow-hidden">
      {/* Image skeleton */}
      <div className="relative h-20 rounded-t-lg bg-[hsl(var(--cream))] animate-pulse" />

      {/* Content skeleton */}
      <div className="p-2.5 space-y-2">
        <div className="h-3.5 w-16 bg-[hsl(var(--cream))] rounded animate-pulse" />
        <div className="h-4 w-24 bg-[hsl(var(--cream))] rounded animate-pulse" />
        <div className="h-3 w-32 bg-[hsl(var(--cream))] rounded animate-pulse" />
        <div className="mt-2 h-4 w-20 bg-[hsl(var(--cream))] rounded animate-pulse" />
        <div className="h-7 w-full bg-[hsl(var(--forest))]/10 rounded-md animate-pulse" />
      </div>
    </div>
  )
}

export function CattleDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="aspect-square bg-[hsl(var(--cream))] rounded-lg animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 w-32 bg-[hsl(var(--cream))] rounded animate-pulse" />
          <div className="h-10 w-3/4 bg-[hsl(var(--cream))] rounded animate-pulse" />
          <div className="h-6 w-1/3 bg-[hsl(var(--cream))] rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-[hsl(var(--cream))] rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-[hsl(var(--cream))]/50 rounded-lg">
          <div className="h-4 w-1/4 bg-[hsl(var(--cream))] rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-[hsl(var(--cream))] rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-[hsl(var(--cream))] rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-[hsl(var(--cream))] rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
