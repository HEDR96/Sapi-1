# Task 1.2: Add Pagination Dots & Arrows di Detail Page

## Overview
Update CattleProfile component untuk menambahkan pagination dots, arrows, dan thumbnail strip pada image gallery.

## Files to Modify
- `src/components/cattle/CattleProfile.tsx`

## Requirements

### 1. Pagination Arrows
- Arrow kiri untuk previous image
- Arrow kanan untuk next image
- Posisi: absolute di kiri dan kanan tengah gambar
- Styling: `absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90`
- Gunakan icon ChevronLeft dan ChevronRight dari lucide-react

### 2. Pagination Dots
- Dots indicator di bawah gambar
- Active dot: `bg-[hsl(var(--forest))] w-6`
- Inactive dot: `bg-[hsl(var(--line))] h-2.5 w-2.5 rounded-full`
- Styling container: `flex justify-center gap-2 mt-2`

### 3. Thumbnail Strip
- Thumbnail gallery di bawah dots
- Ukuran: `w-16 h-16`
- Active thumbnail: `border-[hsl(var(--forest))]`
- Inactive thumbnail: `border-transparent`
- Styling: `flex gap-2 overflow-x-auto pb-1`

## Code Example

```tsx
{/* Arrows */}
{allImages.length > 1 && (
  <>
    <button
      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
      className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
    >
      <ChevronLeft className="h-5 w-5 text-[hsl(var(--forest))]" />
    </button>
    <button
      onClick={() => setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
    >
      <ChevronRight className="h-5 w-5 text-[hsl(var(--forest))]" />
    </button>
  </>
)}

{/* Dots */}
{allImages.length > 1 && (
  <div className="flex justify-center gap-2 mt-2">
    {allImages.map((_, idx) => (
      <button
        key={idx}
        onClick={() => setCurrentImageIndex(idx)}
        className={`h-2.5 w-2.5 rounded-full transition-all ${
          idx === currentImageIndex
            ? 'bg-[hsl(var(--forest))] w-6'
            : 'bg-[hsl(var(--line))] hover:bg-[hsl(var(--forest))/50'
        }`}
      />
    ))}
  </div>
)}

{/* Thumbnails */}
{allImages.length > 1 && (
  <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
    {allImages.map((img, idx) => (
      <button
        key={idx}
        onClick={() => setCurrentImageIndex(idx)}
        className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
          idx === currentImageIndex
            ? 'border-[hsl(var(--forest))]'
            : 'border-transparent hover:border-[hsl(var(--forest))/50'
        }`}
      >
        <Image src={img} alt="" fill className="object-cover" sizes="64px" />
      </button>
    ))}
  </div>
)}
```

## Implementation Notes
- Pastikan state `currentImageIndex` dan `allImages` sudah ada
- Arrows wrap around (dari index terakhir ke index pertama)
- Thumbnails overflow horizontally dengan scroll
- Import ChevronLeft dan ChevronRight dari lucide-react
