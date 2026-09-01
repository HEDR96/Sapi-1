import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { VisitorTracker } from '@/components/layout/VisitorTracker'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <VisitorTracker />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
