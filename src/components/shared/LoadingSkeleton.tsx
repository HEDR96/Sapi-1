export function CattleCardSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden border">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}

export function CattleDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="aspect-square bg-muted rounded-lg animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
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
        <div key={i} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
