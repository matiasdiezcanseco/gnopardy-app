# Components Guide 🧩

This document covers the use of shadcn/ui components and component architecture in Geopardy.

## Overview

Geopardy uses **shadcn/ui** for its component library. Unlike traditional component libraries, shadcn/ui components are copied directly into your project, giving you full control over customization.

## What is shadcn/ui?

shadcn/ui is a collection of re-usable components built with:

- **Radix UI** - Unstyled, accessible primitives
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Full type safety

**Key Principle**: Components are not installed as a package. Instead, they're copied into your project's `components/ui` folder.

---

## Setup

### Installing the CLI

Initialize shadcn/ui in your project:

```bash
pnpm dlx shadcn@latest init
```

This will:

1. Create a `components.json` configuration file
2. Set up the `components/ui` directory
3. Configure CSS variables for theming

### Adding Components

Add components as needed:

```bash
# Add a single component
pnpm dlx shadcn@latest add button

# Add multiple components
pnpm dlx shadcn@latest add button card dialog

# Add all components (not recommended)
pnpm dlx shadcn@latest add --all
```

---

## Recommended Components for Geopardy

### Essential Components

| Component       | Usage in Geopardy                             |
| --------------- | --------------------------------------------- |
| **Button**      | Submit answers, navigation, controls          |
| **Card**        | Question display, category cards, score cards |
| **Dialog**      | Question popups, confirmations                |
| **Badge**       | Point values, status indicators               |
| **Input**       | Text answer input                             |
| **Radio Group** | Multiple choice answers                       |
| **Progress**    | Timer, game progress                          |
| **Alert**       | Correct/incorrect feedback                    |
| **Avatar**      | Player profiles                               |
| **Tabs**        | Category navigation                           |

### Install Command

```bash
pnpm dlx shadcn@latest add button card dialog badge input radio-group progress alert avatar tabs
```

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── game/            # Game-specific components
│   │   ├── GameBoard.tsx
│   │   ├── CategoryColumn.tsx
│   │   ├── QuestionCell.tsx
│   │   └── ScoreDisplay.tsx
│   ├── question/        # Question components
│   │   ├── QuestionView.tsx
│   │   ├── MultipleChoice.tsx
│   │   ├── TextInput.tsx
│   │   ├── AudioPlayer.tsx
│   │   └── VideoPlayer.tsx
│   └── layout/          # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Container.tsx
```

---

## Component Examples

### Button Usage

```tsx
import { Button } from "~/components/ui/button";

// Variants
<Button>Default</Button>
<Button variant="destructive">Wrong Answer</Button>
<Button variant="outline">Skip</Button>
<Button variant="secondary">Back</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="link">Learn More</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// With loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Submitting...
</Button>
```

### Card for Questions

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>History - $400</CardTitle>
    <CardDescription>Answer the following question</CardDescription>
  </CardHeader>
  <CardContent>
    <p>In what year did World War II end?</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Skip</Button>
    <Button>Submit Answer</Button>
  </CardFooter>
</Card>;
```

### Dialog for Question Modal

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button className="text-4xl font-bold">$200</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>History - $200</DialogTitle>
      <DialogDescription>Answer correctly to earn 200 points</DialogDescription>
    </DialogHeader>
    <div className="py-4">{/* Question content */}</div>
  </DialogContent>
</Dialog>;
```

### Radio Group for Multiple Choice

```tsx
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

<RadioGroup defaultValue="option-1">
  {answers.map((answer, index) => (
    <div key={answer.id} className="flex items-center space-x-2">
      <RadioGroupItem value={`option-${index}`} id={`option-${index}`} />
      <Label htmlFor={`option-${index}`}>{answer.text}</Label>
    </div>
  ))}
</RadioGroup>;
```

### Alert for Answer Feedback

```tsx
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

// Correct answer
<Alert className="border-green-500 bg-green-50">
  <CheckCircle2 className="h-4 w-4 text-green-500" />
  <AlertTitle>Correct!</AlertTitle>
  <AlertDescription>
    You earned 400 points!
  </AlertDescription>
</Alert>

// Wrong answer
<Alert variant="destructive">
  <XCircle className="h-4 w-4" />
  <AlertTitle>Incorrect</AlertTitle>
  <AlertDescription>
    The correct answer was: 1945
  </AlertDescription>
</Alert>
```

---

## Custom Game Components

### GameBoard Component

```tsx
// components/game/GameBoard.tsx
import { CategoryColumn } from "./CategoryColumn";

interface GameBoardProps {
  categories: Category[];
  onSelectQuestion: (questionId: number) => void;
}

export function GameBoard({ categories, onSelectQuestion }: GameBoardProps) {
  return (
    <div className="grid grid-cols-5 gap-4 p-4">
      {categories.map((category) => (
        <CategoryColumn
          key={category.id}
          category={category}
          onSelectQuestion={onSelectQuestion}
        />
      ))}
    </div>
  );
}
```

### QuestionCell Component

```tsx
// components/game/QuestionCell.tsx
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface QuestionCellProps {
  points: number;
  isAnswered: boolean;
  onClick: () => void;
}

export function QuestionCell({
  points,
  isAnswered,
  onClick,
}: QuestionCellProps) {
  return (
    <Button
      variant="default"
      className={cn(
        "aspect-square text-2xl font-bold text-yellow-400",
        isAnswered && "cursor-not-allowed opacity-50",
      )}
      disabled={isAnswered}
      onClick={onClick}
    >
      ${points}
    </Button>
  );
}
```

---

## Utility Function

Create a `cn` utility for merging Tailwind classes:

```tsx
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Install dependencies:

```bash
pnpm add clsx tailwind-merge
```

---

## Component Best Practices

### 1. Composition Over Configuration

Build complex components by composing smaller ones:

```tsx
// Good: Composable
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Avoid: Prop-heavy
<Card title="Title" content="Content" />
```

### 2. Use Variants

Define component variants for consistent styling:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        correct: "bg-green-500 text-white",
        incorrect: "bg-red-500 text-white",
      },
    },
  },
);
```

### 3. Keep Components Pure

Components should be predictable based on their props:

```tsx
// Pure component
function ScoreDisplay({ score }: { score: number }) {
  return <span className="text-4xl font-bold">{score}</span>;
}
```

### 4. Co-locate Related Files

Keep related files together:

```
components/
└── game/
    ├── GameBoard.tsx
    ├── GameBoard.test.tsx
    ├── GameBoard.stories.tsx
    └── index.ts
```

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Component Examples](https://ui.shadcn.com/examples)

---

_Add components incrementally as needed rather than installing everything upfront._
