# Task 2.2: Create AuthModal Component

## Overview
Create modal untuk login, register, dan verifikasi email dalam satu component.

## Files to Create
- `src/components/auth/AuthModal.tsx`
- `src/components/auth/VerificationForm.tsx`

## Files to Modify
- `src/components/layout/Navbar.tsx`

## Requirements

### 1. AuthModal Component
File: `src/components/auth/AuthModal.tsx`

Features:
- 3 views: login, register, verify
- Modal dengan backdrop blur
- Close button
- Error display
- State management untuk view switching

### 2. VerificationForm Component
File: `src/components/auth/VerificationForm.tsx`

Features:
- 6-digit code input
- Resend code button
- Success animation
- Back button

### 3. Navbar Integration
File: `src/components/layout/Navbar.tsx`

Changes:
- Add useState untuk modal open
- Replace login button dengan modal trigger
- Import dan render AuthModal

## Code Structure

```tsx
// AuthModal.tsx
'use client'
import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { VerificationForm } from './VerificationForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthView = 'login' | 'register' | 'verify'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ... login, register, verify handlers
}
```

## API Endpoints Used
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/verify
- POST /api/auth/resend-verify

## Implementation Notes
- Gunakan 'use client' directive
- Handle loading states dengan Loader2 spinner
- Show error messages dengan styling yang sesuai
- Reload page setelah successful verification
