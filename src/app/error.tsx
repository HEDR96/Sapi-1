'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-destructive">Oops!</h1>
        <h2 className="text-2xl font-semibold">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground">
          Maaf, terjadi kesalahan yang tidak terduga.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>Coba Lagi</Button>
          <Link href="/">
            <Button variant="outline">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
