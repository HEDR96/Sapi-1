import Link from 'next/link'
import { Beef } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-full bg-primary p-2">
            <Beef className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">SapiKatalog</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Katalog
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
