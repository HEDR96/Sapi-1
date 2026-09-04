'use client'

import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { VisitorTracker } from '../components/layout/VisitorTracker'
import './globals.css'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>
        <VisitorTracker />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
