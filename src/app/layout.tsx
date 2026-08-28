import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Katalog Sapi - Temukan Sapi Berkualitas',
    template: '%s | Katalog Sapi',
  },
  description: 'Katalog sapi pilihan dengan informasi lengkap, transparan, dan riwayat pertumbuhan yang terdokumentasi.',
  keywords: ['katalog sapi', 'sapi berkualitas', 'peternakan', 'limousin', 'simental', 'brahman'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
