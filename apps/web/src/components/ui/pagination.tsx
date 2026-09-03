import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-md border border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(var(--cream))] transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded-md border border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))] transition-colors"
          >
            1
          </button>
          {start > 2 && <span className="px-1 text-[hsl(var(--forest))/50]">...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md border transition-colors ${
            page === currentPage
              ? 'bg-[hsl(var(--forest))] text-white border-[hsl(var(--forest))]'
              : 'border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))]'
          }`}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-[hsl(var(--forest))/50]">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 rounded-md border border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))] transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-md border border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(var(--cream))] transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
