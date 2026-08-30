import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Nusa Farm - Qurban Transparan',
    template: '%s | Nusa Farm',
  },
  description: 'Katalog sapi qurban dengan tracking progress sapi. Pilih sapi pilihan, pantau perkembangannya, dan beli dengan tenang.',
  keywords: ['katalog sapi', 'sapi qurban', 'peternakan', 'limousin', 'simental', 'brahman', 'qurban', 'idul adha'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.variable} ${cormorant.variable}`}>
        {children}
      </body>
    </html>
  )
}
