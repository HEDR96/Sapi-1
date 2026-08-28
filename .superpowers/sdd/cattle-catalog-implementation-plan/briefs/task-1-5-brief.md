# Task 1.5: Create Shared Components

## Goal
Create reusable shared components.

## Files to Create
- `src/components/shared/EmptyState.tsx`
- `src/components/shared/LoadingSkeleton.tsx`
- `src/components/shared/Breadcrumb.tsx`

## src/components/shared/EmptyState.tsx
```typescript
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
      <div className="rounded-full bg-muted p-4 mb-4">
        {icon || <FileQuestion className="h-10 w-10 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
      )}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}
```

## src/components/shared/LoadingSkeleton.tsx
Create skeleton components for loading states:

```typescript
export function CattleCardSkeleton() {
  // Returns a skeleton card with:
  // - image area (aspect-[4/3])
  // - content area with lines for title, code, breed, weight, price
  // Use bg-muted animate-pulse
}

export function CattleDetailSkeleton() {
  // Returns a skeleton for the detail page with:
  // - two column layout
  // - image placeholder
  // - info placeholders
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  // Returns rows skeleton for table loading
}
```

## src/components/shared/Breadcrumb.tsx
```typescript
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
```

## Verification
- Components render without errors
- TypeScript compiles
