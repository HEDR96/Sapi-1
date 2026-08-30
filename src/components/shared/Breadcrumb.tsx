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
    <nav className="flex items-center gap-2 text-[11px] text-[hsl(var(--forest))/55]">
      <Link href="/" className="hover:text-[hsl(var(--forest))] transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          <ChevronRight className="h-3 w-3" />
          {item.href ? (
            <Link href={item.href} className="hover:text-[hsl(var(--forest))] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[hsl(var(--forest))] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
