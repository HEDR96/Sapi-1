# Task 1.8: Create Catalog Components

## Goal
Create all catalog components: HeroSection, StatisticsBar, SearchFilter, CattleGrid, CattleCard, CattleStatusBadge.

## Files to Create
- `src/components/catalog/CattleStatusBadge.tsx`
- `src/components/catalog/CattleCard.tsx`
- `src/components/catalog/HeroSection.tsx`
- `src/components/catalog/StatisticsBar.tsx`
- `src/components/catalog/SearchFilter.tsx`
- `src/components/catalog/CattleGrid.tsx`
- `src/app/(public)/page.tsx`

## src/components/catalog/CattleStatusBadge.tsx
Badge showing cattle status with appropriate colors:
- AVAILABLE: green background, green text
- SOLD: red background, red text
- RESERVED: yellow background, yellow text
- ARCHIVED: gray background, gray text

Include a colored dot indicator.

## src/components/catalog/CattleCard.tsx
Card component for displaying cattle in grid:
- Image area with aspect-[4/3]
- Status badge overlay
- Name, code, breed, weight, price
- "Lihat Detail" link with arrow icon
- Hover effects (shadow, translate-y)
- Link to /sapi/[code]

Use next/image for images.

## src/components/catalog/HeroSection.tsx
Hero section with:
- Full-width background image (cattle image from Unsplash)
- Dark overlay gradient
- Large heading: "Katalog Sapi Pilihan"
- Subheading text
- Two CTA buttons: "Lihat Katalog" and "Sapi Tersedia"
- Height: 500px
- Responsive text sizes

## src/components/catalog/StatisticsBar.tsx
Statistics bar showing:
- Total Sapi
- Tersedia
- Terjual

Fetch data from /api/cattle and calculate stats.
Use useEffect to fetch data.
Show loading skeletons while loading.

## src/components/catalog/SearchFilter.tsx
Search and filter component:
- Search input with icon
- Filter button
- Dropdowns for: Status, Jenis Sapi
- Reset button when filters active
- Collapsible filter section

Use shadcn/ui Select component.
Support these filter values:
- Status: Semua, Tersedia, Terjual, Diboeking, Diarchive
- Jenis: Semua, Limousin, Simental, Brahman, Angus, Lainnya

Call onSearch callback with filter values.

## src/components/catalog/CattleGrid.tsx
Main catalog grid:
- Receives search filters and page
- Fetches cattle from API
- Displays grid of CattleCard components
- Shows loading skeletons
- Shows empty state when no results
- Shows pagination
- Responsive: 1 col mobile, 2 col tablet, 3-4 col desktop

Use 'use client' directive.
Use useSearchParams for URL sync.

## src/app/(public)/page.tsx
Homepage:
```typescript
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
```

## Verification
- All components render correctly
- Search and filters work
- Pagination works
- Responsive design works
