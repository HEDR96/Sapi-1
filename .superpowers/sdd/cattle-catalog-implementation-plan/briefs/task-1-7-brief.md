# Task 1.7: Create Public Layout and Homepage

## Goal
Create the main app layout, public layout, and homepage with all public-facing components.

## Files to Create/Modify
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/(public)/layout.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`

## src/app/globals.css
Update with CSS variables for our design system:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --radius: 0.5rem;
    --background: 0 0% 100%;
    --foreground: 20 14.3% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 20 14.3% 4.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 20 14.3% 4.1%;
    --primary: 142 76% 24%; /* Dark Forest Green */
    --primary-foreground: 355.7 100% 97.3%;
    --secondary: 20 5.9% 90%;
    --secondary-foreground: 20 14.3% 4.1%;
    --muted: 20 5.9% 90%;
    --muted-foreground: 20 10% 40%;
    --accent: 43 96% 47%; /* Warm Gold */
    --accent-foreground: 20 14.3% 4.1%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 60 9.1% 97.8%;
    --border: 20 5.9% 90%;
    --input: 20 5.9% 90%;
    --ring: 142 76% 24%;
  }

  .dark {
    /* Dark mode colors */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

## src/app/layout.tsx
Root layout with metadata:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Katalog Sapi - Temukan Sapi Berkualitas',
    template: '%s | Katalog Sapi',
  },
  description: 'Katalog sapi pilihan dengan informasi lengkap...',
  keywords: ['katalog sapi', 'sapi berkualitas', 'peternakan', ...],
}
```

## src/components/layout/Navbar.tsx
Sticky navbar with:
- Logo (Beef icon from lucide-react + "SapiKatalog" text)
- Nav links: Katalog, Admin
- Use primary colors

## src/components/layout/Footer.tsx
Simple footer with:
- Copyright text
- Simple design

## src/app/(public)/layout.tsx
Layout wrapper with Navbar and Footer:
```typescript
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
```

## Verification
- Page loads without errors
- Navbar is sticky
- Footer is at bottom
