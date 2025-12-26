# Styling Guide 🎨

This document covers the styling approach, Tailwind CSS configuration, and design conventions for Jeopardy.

## Overview

Jeopardy uses **Tailwind CSS 4** for styling with a utility-first approach. Components are styled using Tailwind classes, with shadcn/ui providing pre-built, customizable UI components.

## Tailwind CSS Setup

### Configuration

Tailwind is configured through:

- `postcss.config.js` - PostCSS configuration with Tailwind plugin
- `src/styles/globals.css` - Global styles and Tailwind directives

### Global Styles

The main stylesheet (`src/styles/globals.css`) should include:

```css
@import "tailwindcss";

/* Custom CSS variables for theming */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode variables */
}
```

---

## Design System

### Color Palette

The Jeopardy color scheme should reflect the game's exciting, competitive nature:

| Color            | Usage                       | CSS Variable    |
| ---------------- | --------------------------- | --------------- |
| **Primary Blue** | Buttons, links, accents     | `--primary`     |
| **Gold/Yellow**  | Points, highlights, success | `--accent`      |
| **Deep Navy**    | Backgrounds, headers        | `--background`  |
| **White**        | Text, cards                 | `--foreground`  |
| **Red**          | Errors, wrong answers       | `--destructive` |
| **Green**        | Correct answers, success    | `--success`     |

### Typography

```css
/* Font configuration */
--font-sans: "Inter", system-ui, sans-serif;
--font-display: "Space Grotesk", sans-serif; /* For headings */
--font-mono: "JetBrains Mono", monospace; /* For code/points */
```

**Scale**:
| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Labels, captions |
| `text-sm` | 14px | Secondary text |
| `text-base` | 16px | Body text |
| `text-lg` | 18px | Large body |
| `text-xl` | 20px | Small headings |
| `text-2xl` | 24px | Section headings |
| `text-4xl` | 36px | Page titles |
| `text-6xl` | 60px | Point values |

### Spacing

Use Tailwind's spacing scale consistently:

```
4 = 1rem = 16px (base unit)
```

Common patterns:

- Card padding: `p-4` or `p-6`
- Section spacing: `space-y-8`
- Grid gaps: `gap-4` or `gap-6`

---

## Component Patterns

### Game Board Styling

```tsx
// Category grid
<div className="grid grid-cols-5 gap-4">
  {categories.map(category => (
    <div className="bg-primary text-primary-foreground p-4 text-center font-bold">
      {category.name}
    </div>
  ))}
</div>

// Question cells
<button className="
  aspect-square
  bg-primary/90
  hover:bg-primary
  text-4xl
  font-bold
  text-yellow-400
  transition-all
  hover:scale-105
  disabled:opacity-50
  disabled:cursor-not-allowed
">
  $200
</button>
```

### Cards

```tsx
<div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
  {/* Card content */}
</div>
```

### Buttons

```tsx
// Primary button
<button className="
  bg-primary
  text-primary-foreground
  hover:bg-primary/90
  px-4
  py-2
  rounded-md
  font-medium
  transition-colors
">
  Submit Answer
</button>

// Outline button
<button className="
  border
  border-input
  bg-background
  hover:bg-accent
  hover:text-accent-foreground
  px-4
  py-2
  rounded-md
">
  Skip
</button>
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Width  | Usage            |
| ---------- | ------ | ---------------- |
| `sm`       | 640px  | Mobile landscape |
| `md`       | 768px  | Tablets          |
| `lg`       | 1024px | Laptops          |
| `xl`       | 1280px | Desktops         |
| `2xl`      | 1536px | Large screens    |

### Mobile-First Approach

Always design mobile-first, then add responsive modifiers:

```tsx
<div className="
  grid
  grid-cols-2      /* Mobile: 2 columns */
  md:grid-cols-4   /* Tablet: 4 columns */
  lg:grid-cols-6   /* Desktop: 6 columns */
  gap-2
  md:gap-4
">
```

### Game Board Responsiveness

```tsx
// Responsive game board
<div className="
  grid
  grid-cols-3
  sm:grid-cols-4
  md:grid-cols-5
  lg:grid-cols-6
  gap-2
  md:gap-4
  p-4
">
```

---

## Animations

### Transitions

Use Tailwind's transition utilities for smooth interactions:

```tsx
<button className="
  transition-all
  duration-200
  ease-in-out
  hover:scale-105
  active:scale-95
">
```

### Common Animations

```css
/* Add to globals.css */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}
```

### Question Reveal Animation

```tsx
<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
  {/* Question content */}
</div>
```

---

## Dark Mode

### Implementation

Tailwind supports dark mode with the `dark:` prefix:

```tsx
<div className="
  bg-white
  dark:bg-gray-900
  text-gray-900
  dark:text-white
">
```

### Toggle Implementation

```tsx
// Add to html element
<html className="dark">{/* Dark mode enabled */}</html>
```

---

## Best Practices

### 1. Use Design Tokens

Prefer CSS variables over hardcoded values:

```tsx
// ✅ Good
<div className="bg-primary text-primary-foreground">

// ❌ Avoid
<div className="bg-blue-600 text-white">
```

### 2. Extract Common Patterns

For repeated patterns, consider Tailwind's `@apply`:

```css
/* In globals.css */
.game-cell {
  @apply bg-primary/90 hover:bg-primary aspect-square text-4xl font-bold text-yellow-400 transition-all hover:scale-105;
}
```

### 3. Organize Classes

Keep class lists organized by category:

```tsx
<button className="
  /* Layout */
  flex items-center justify-center
  /* Sizing */
  w-full h-12 px-4
  /* Typography */
  text-sm font-medium
  /* Colors */
  bg-primary text-white
  /* States */
  hover:bg-primary/90 focus:ring-2
  /* Transitions */
  transition-colors duration-200
">
```

### 4. Use clsx/cn for Conditional Classes

```tsx
import { cn } from "~/lib/utils";

<button className={cn(
  "px-4 py-2 rounded-md",
  isCorrect && "bg-green-500",
  isWrong && "bg-red-500",
  !answered && "bg-primary"
)}>
```

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS v4 Migration](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)

---

_Maintain consistent styling across the application for a polished user experience._
