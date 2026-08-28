import { HeroSection } from '@/components/catalog/HeroSection'
import { StatisticsBar } from '@/components/catalog/StatisticsBar'
import { CattleGrid } from '@/components/catalog/CattleGrid'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatisticsBar />
      <CattleGrid />
    </>
  )
}
