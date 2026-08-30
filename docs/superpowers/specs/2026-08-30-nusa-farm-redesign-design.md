# samadyafarm.id Website Redesign - Design Spec

## Overview
Redesign entire website following 100% the reference design from `desian web.html`.

## Design System

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| cream | `#F7F2E7` | Primary background |
| cream2 | `#FBF8F1` | Secondary background |
| line | `#E7DCC5` | Borders |
| forest | `#173F31` | Primary green |
| forest2 | `#1E5A43` | Secondary green |
| gold | `#D8A63E` | Accent/highlight |
| softgold | `#E9D1A0` | Light gold |
| olive | `#7A8B67` | Secondary accent |

### Typography
- **Display**: Cormorant Garamond (600, 700) - Headings
- **Body**: Inter (400-800) - Body text

### Animations
- Scroll reveal with fade-up effect
- Animated counters with easing
- Float animation for QR tag
- Card hover lift effect

## Components Created/Updated

### Core Components (Phase 1)
- [x] `globals.css` - Updated CSS variables, color palette, fonts, utilities
- [x] `layout.tsx` - Updated with new fonts and metadata
- [x] `Navbar` - Header with logo, nav links, CTA buttons, mobile menu
- [x] `HeroSection` - 3-column layout with photo, content, and animated QR tag
- [x] `JourneySection` - 6-step cara kerja dengan icon orbs
- [x] `TrustRow` - 5 trust indicators
- [x] `CTASection` - Gradient CTA banner
- [x] `Footer` - 5-column footer with social links

### Catalog Components (Phase 2)
- [x] `CattleCard` - Card dengan hover effect, status badge
- [x] `CattleGrid` - Grid dengan horizontal scroll di mobile
- [x] `StatisticsBar` - Animated counters
- [x] `CattleStatusBadge` - Status badge (TERSEDIA/SOLD)

### Interactive Components (Phase 3)
- [x] `CattleProfile` - Full cow detail with tabs
- [x] `CattleStats` - Weight progress stats
- [x] `QRCodeCard` - QR code display (placeholder)

### Shared Components
- [x] `EmptyState` - Empty state display
- [x] `Breadcrumb` - Breadcrumb navigation
- [x] `LoadingSkeleton` - Loading skeletons
- [x] `AdminSidebar` - Admin sidebar navigation
- [x] `AdminHeader` - Admin header

### Pages
- [x] `/` - Landing page with all new components
- [x] `/sapi/[code]` - Full cow detail page
- [x] `/admin/*` - Admin dashboard and components

## Implementation Status
- [x] Design document created
- [x] Design system (globals.css, layout)
- [x] Core components (Navbar, Hero, Journey, Trust, CTA, Footer)
- [x] Catalog components (Card, Grid, Statistics, Status)
- [x] Detail page (CattleProfile)
- [x] Admin components
- [x] Shared components
- [x] Build verified

## Notes
- Build passes successfully
- All TypeScript errors resolved
- Lucide icons used throughout
- All components use CSS variables for theming
- Mobile responsive design maintained
- Animations (scroll reveal, counter, hover effects) implemented
