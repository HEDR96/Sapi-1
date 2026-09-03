import { FileQuestion } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-[hsl(var(--cream))] p-4 mb-4">
        {icon || <FileQuestion className="h-10 w-10 text-[hsl(var(--forest))/50]" />}
      </div>
      <h3 className="text-lg font-semibold text-[hsl(var(--forest))] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[hsl(var(--forest))/60] mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-md bg-[hsl(var(--forest))] px-4 py-2 text-sm font-semibold text-white hover:bg-[hsl(var(--forest2))] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
