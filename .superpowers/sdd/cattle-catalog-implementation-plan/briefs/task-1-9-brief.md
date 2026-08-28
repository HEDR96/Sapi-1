# Task 1.9: Create Cattle Detail Page

## Goal
Create the cattle detail page with all sections.

## Files to Create
- `src/app/(public)/sapi/[code]/page.tsx`
- `src/components/cattle/CattleProfile.tsx`
- `src/components/cattle/CattleStats.tsx`
- `src/components/cattle/CattleGallery.tsx`
- `src/components/weight/WeightHistory.tsx`
- `src/components/weight/WeightChart.tsx`
- `src/components/health/HealthTimeline.tsx`
- `src/components/feed/FeedHistory.tsx`
- `src/components/media/DocumentationGallery.tsx`
- `src/components/cattle/QRCodeCard.tsx`

## src/app/(public)/sapi/[code]/page.tsx
Server component that fetches cattle data and renders CattleProfile.

Use generateMetadata for SEO:
- Title: [name] - [code]
- Description: cattle description or default
- OpenGraph image: mainImage

If cattle not found, call notFound().

## src/components/cattle/CattleProfile.tsx
Main detail page component:
- Breadcrumb (Home > Katalog > code)
- Two-column layout: Gallery + Info
- Quick stats bar
- Tabs for desktop / Accordion for mobile
- QR Code section
- Related cattle section

Tabs content:
1. Ringkasan - Summary of weight stats
2. Riwayat Timbang - Weight history table + chart
3. Kesehatan - Health records timeline
4. Pakan - Feed records list
5. Dokumentasi - Media gallery

## src/components/cattle/CattleStats.tsx
Stats display:
- Last weight
- ADG
- Target weight
- Progress percentage

Show progress bar using shadcn/ui Progress.

## src/components/cattle/CattleGallery.tsx
Image gallery with:
- Main large image
- Thumbnail strip below
- Lightbox on click (fullscreen with prev/next)
- Navigation arrows in lightbox
- Close button

Use next/image with fill.

## src/components/weight/WeightHistory.tsx
Weight history table:
- Date | Weight | Kenaikan columns
- Show + sign for weight gain
- Sorted by date ascending

## src/components/weight/WeightChart.tsx
Line chart using Recharts:
- X-axis: Date
- Y-axis: Weight (Kg)
- Tooltip showing date, weight, gain
- Responsive container
- Smooth curve

## src/components/health/HealthTimeline.tsx
Health records display:
- Date, Type, Status, Notes
- Status badges with colors:
  - SEHAT: green
  - DALAM_PERAWATAN: purple
  - OBSERVASI: yellow
  - SAKIT: red
  - SEMBUH: blue

## src/components/feed/FeedHistory.tsx
Feed records display:
- Date
- Feed types (parsed from JSON array)
- Amount
- Frequency
- Notes

## src/components/media/DocumentationGallery.tsx
Media gallery:
- Grid of images/videos
- Click to preview
- Filter by type (IMAGE/VIDEO)
- Use Lucide icons for video indicator

## src/components/cattle/QRCodeCard.tsx
QR Code display:
- Generate QR code pointing to cattle detail URL
- Show cattle name and code
- Download button (download as PNG)
- Print button

Use qrcode.react library (QRCodeSVG component).

## Verification
- Detail page loads with all sections
- Tabs/Accordion work
- Gallery lightbox works
- Chart displays correctly
- QR code generates and can be downloaded
