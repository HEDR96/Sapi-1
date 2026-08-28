# Task 1.4: Create shadcn/ui Components

## Goal
Initialize shadcn/ui and add required components.

## Prerequisites
- Task 1.1 must be complete (npm install done)

## Steps

### 1. Initialize shadcn/ui
Run in the d:/Sapi directory:
```
npx shadcn-ui@latest init
```

Select these options when prompted:
- Style: Default
- Base color: Slate
- CSS file: src/app/globals.css
- CSS variables: Yes
- Customize default configuration: No

### 2. Add Required Components
Run these commands:
```
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add table
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add label
npx shadcn-ui@latest add pagination
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add avatar
```

### 3. Update globals.css
Add custom CSS variables for our design system:

```css
@layer base {
  :root {
    --primary: 142 76% 24%; /* Forest Green */
    --primary-foreground: 355.7 100% 97.3%;
    --accent: 43 96% 47%; /* Gold */
    --accent-foreground: 20 14.3% 4.1%;
    /* ... other CSS variables from plan */
  }
}
```

## Verification
- components.json is created in project root
- All UI components are in src/components/ui/
- globals.css has CSS variables
