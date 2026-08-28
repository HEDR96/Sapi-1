# Task 1.1: Initialize Next.js Project

## Goal
Initialize Next.js 14 project with TypeScript, Tailwind CSS, and all required dependencies.

## Files to Create
- `package.json`
- `tsconfig.json`
- `next.config.js`
- `tailwind.config.ts`
- `postcss.config.js`
- `.env.example`
- `.gitignore`

## Required Dependencies
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.15.0",
    "recharts": "^2.12.0",
    "qrcode.react": "^3.1.0",
    "zod": "^3.23.0",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.395.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  }
}
```

## devDependencies
```json
{
  "devDependencies": {
    "prisma": "^5.15.0",
    "typescript": "^5.4.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/bcryptjs": "^2.4.6",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "tsx": "^4.10.0"
  }
}
```

## Steps
1. Create package.json with all dependencies
2. Create tsconfig.json with strict mode
3. Create next.config.js with image remote patterns
4. Create tailwind.config.ts with custom colors (primary green, accent gold)
5. Create postcss.config.js
6. Create .env.example
7. Create .gitignore
8. Run npm install

## Verification
- `npm run dev` starts without errors
- TypeScript compiles without errors
