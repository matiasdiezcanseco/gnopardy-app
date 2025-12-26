# Folder Structure 📁

This document explains the project organization and architecture of the Jeopardy application.

## Project Root

```
jeopardy-app/
├── docs/                   # 📚 Project documentation
├── node_modules/           # 📦 Dependencies (git-ignored)
├── public/                 # 🌐 Static assets
├── src/                    # 💻 Application source code
├── .env                    # 🔐 Environment variables (git-ignored)
├── .env.example            # 📋 Environment template
├── .gitignore              # 🚫 Git ignore rules
├── drizzle.config.ts       # 🗄️ Drizzle ORM configuration
├── eslint.config.js        # 📏 ESLint configuration
├── next-env.d.ts           # ⚙️ Next.js TypeScript declarations
├── next.config.js          # ⚙️ Next.js configuration
├── package.json            # 📦 Project dependencies and scripts
├── pnpm-lock.yaml          # 🔒 Dependency lock file
├── postcss.config.js       # 🎨 PostCSS configuration
├── prettier.config.js      # ✨ Prettier configuration
├── README.md               # 📖 Project readme
├── start-database.sh       # 🐳 Database startup script
└── tsconfig.json           # ⚙️ TypeScript configuration
```

---

## Source Directory (`src/`)

The main application code lives in the `src/` directory:

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── ...                 # Additional routes
├── components/             # React components (to be created)
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Custom components
├── lib/                    # Utility functions (to be created)
├── server/                 # Server-side code
│   └── db/                 # Database layer
│       ├── index.ts        # Database connection
│       └── schema.ts       # Drizzle schema definitions
├── styles/                 # Global styles
│   └── globals.css         # Tailwind CSS imports
└── env.js                  # Environment variable validation
```

---

## App Router Structure

Next.js App Router uses file-system based routing:

```
src/app/
├── layout.tsx              # Root layout (wraps all pages)
├── page.tsx                # Home page (/)
├── globals.css             # Global styles (or in styles/)
│
├── game/                   # Game routes
│   ├── page.tsx            # Game board (/game)
│   ├── layout.tsx          # Game layout
│   └── [id]/               # Dynamic game route
│       └── page.tsx        # Specific game (/game/123)
│
├── question/               # Question routes
│   └── [id]/               # Dynamic question route
│       └── page.tsx        # Question view (/question/456)
│
├── admin/                  # Admin routes (optional)
│   ├── page.tsx            # Admin dashboard (/admin)
│   ├── categories/         # Category management
│   │   └── page.tsx        # (/admin/categories)
│   └── questions/          # Question management
│       └── page.tsx        # (/admin/questions)
│
└── api/                    # API routes
    ├── questions/
    │   └── route.ts        # /api/questions
    ├── categories/
    │   └── route.ts        # /api/categories
    └── score/
        └── route.ts        # /api/score
```

---

## Component Organization

```
src/components/
│
├── ui/                     # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
│
├── game/                   # Game-specific components
│   ├── GameBoard.tsx       # Main game board grid
│   ├── CategoryColumn.tsx  # Single category column
│   ├── QuestionCell.tsx    # Clickable question cell
│   ├── ScoreBoard.tsx      # Player scores display
│   └── Timer.tsx           # Optional countdown timer
│
├── question/               # Question-related components
│   ├── QuestionView.tsx    # Question display container
│   ├── MultipleChoice.tsx  # Multiple choice answer UI
│   ├── TextInput.tsx       # Text answer input
│   ├── AudioPlayer.tsx     # Audio question player
│   ├── VideoPlayer.tsx     # Video question player
│   └── AnswerFeedback.tsx  # Correct/incorrect feedback
│
├── player/                 # Player components
│   ├── PlayerCard.tsx      # Individual player display
│   ├── PlayerList.tsx      # List of players
│   └── AddPlayer.tsx       # Add new player form
│
└── layout/                 # Layout components
    ├── Header.tsx          # App header
    ├── Footer.tsx          # App footer
    ├── Container.tsx       # Content container
    └── Navigation.tsx      # Navigation menu
```

---

## Server Directory

```
src/server/
│
├── db/                     # Database layer
│   ├── index.ts            # Database connection and client
│   └── schema.ts           # Drizzle table definitions
│
├── api/                    # Server-side API logic (optional)
│   ├── routers/            # If using tRPC
│   │   ├── category.ts
│   │   ├── question.ts
│   │   └── game.ts
│   └── root.ts
│
└── actions/                # Server Actions (Next.js 14+)
    ├── category.ts         # Category CRUD actions
    ├── question.ts         # Question CRUD actions
    ├── game.ts             # Game management actions
    └── score.ts            # Score update actions
```

---

## Library/Utilities

```
src/lib/
│
├── utils.ts                # General utilities (cn, formatters)
├── constants.ts            # App constants
├── types.ts                # Shared TypeScript types
└── validators.ts           # Zod schemas for validation
```

---

## Public Directory

Static assets served directly:

```
public/
├── favicon.ico             # Browser favicon
├── images/                 # Static images
│   └── logo.png
├── audio/                  # Audio files for questions
│   └── question-1.mp3
└── videos/                 # Video files for questions
    └── question-2.mp4
```

---

## Documentation

```
docs/
├── README.md               # Documentation index
├── PROJECT_OVERVIEW.md     # Project description
├── TECH_STACK.md           # Technologies used
├── DATABASE.md             # Database documentation
├── ENVIRONMENT_VARIABLES.md # Env var reference
├── STYLING.md              # CSS/Tailwind guide
├── COMPONENTS.md           # Component library guide
└── FOLDER_STRUCTURE.md     # This file
```

---

## File Naming Conventions

| Type       | Convention      | Example           |
| ---------- | --------------- | ----------------- |
| Components | PascalCase      | `GameBoard.tsx`   |
| Pages      | lowercase       | `page.tsx`        |
| Utilities  | camelCase       | `formatScore.ts`  |
| Types      | PascalCase      | `GameTypes.ts`    |
| Constants  | UPPER_SNAKE     | in `constants.ts` |
| CSS        | lowercase-kebab | `globals.css`     |
| Schemas    | camelCase       | `schema.ts`       |

---

## Import Aliases

The project uses path aliases configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./src/*"]
    }
  }
}
```

**Usage**:

```typescript
// Instead of relative paths
import { db } from "../../../server/db";

// Use alias
import { db } from "~/server/db";
```

---

## Key Files Explained

| File                      | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `src/app/layout.tsx`      | Root layout wrapping all pages, includes providers |
| `src/app/page.tsx`        | Home page component                                |
| `src/server/db/schema.ts` | Database table definitions                         |
| `src/server/db/index.ts`  | Database connection setup                          |
| `src/env.js`              | Environment variable validation                    |
| `drizzle.config.ts`       | Drizzle CLI configuration                          |
| `next.config.js`          | Next.js build configuration                        |
| `tsconfig.json`           | TypeScript compiler options                        |

---

_Keep the folder structure organized as the project grows. Create new directories when a category of files exceeds 5-7 items._
