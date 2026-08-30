# Task 1.1: Fix Image Fit & Sold Overlay Styling

## Overview
Update CattleCard component untuk memperbaiki image styling dan sold overlay.

## Files to Modify
- `src/components/catalog/CattleCard.tsx` (lines 40-70)

## Requirements

### Image Container
- Gunakan aspect ratio tetap `aspect-[4/3]`
- Gunakan `object-cover` untuk fill container
- Tambahkan `sizes` attribute untuk responsive: `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`

### Sold Overlay
- Background: `bg-black/50` (semi-transparent black)
- Text: "TERJUAL" (huruf kapital)
- Styling: `bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm`
- Posisi: centered di atas gambar dengan z-index tinggi

### Grayscale Effect
- Tambahkan `brightness-50 grayscale` pada gambar saat status SOLD

## Code Example

```tsx
<div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
  {mainImage ? (
    <>
      <Image
        src={mainImage}
        alt={name}
        fill
        className={`object-cover transition-transform duration-300 ${
          isSold ? 'brightness-50 grayscale' : 'group-hover:scale-105'
        }`}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      {/* Sold Overlay */}
      {isSold && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm">
            TERJUAL
          </span>
        </div>
      )}
    </>
  ) : (
    <div className="flex h-full items-center justify-center bg-[hsl(var(--cream))]">
      <span className="text-[10px] text-[hsl(var(--forest))/50]">Tidak Ada Foto</span>
    </div>
  )}
</div>
```

## Implementation Notes
- isSold harus dihitung dari `status === 'SOLD'`
- Sold overlay harus di dalam container gambar
- Pastikan z-index cukup tinggi (z-10)
