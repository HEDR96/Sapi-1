import { ShieldCheck, Menu, Bell, User, LogOut } from 'lucide-react'
import Link from 'next/link'

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[hsl(var(--line))] bg-white px-4">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" aria-label="Menu">
          <Menu className="h-5 w-5 text-[hsl(var(--forest))]" />
        </button>
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full border border-[hsl(var(--forest))/30] bg-[hsl(var(--forest))]">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:block text-[13px] font-extrabold tracking-[.08em] text-[hsl(var(--forest))]">
            samadyafarm.id
          </span>
          <span className="hidden sm:block text-[8px] text-[hsl(var(--forest))/60]">ADMIN</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-[hsl(var(--cream))]" aria-label="Notifications">
          <Bell className="h-4 w-4 text-[hsl(var(--forest))]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button className="flex items-center gap-2 rounded-full hover:bg-[hsl(var(--cream))] p-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[hsl(var(--cream))]">
            <User className="h-4 w-4 text-[hsl(var(--forest))]" />
          </div>
          <span className="hidden md:block text-[11px] font-medium text-[hsl(var(--forest))]">Admin</span>
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-red-50 text-[hsl(var(--forest))/60 hover:text-red-600" aria-label="Logout">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
