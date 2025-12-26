# Tech Stack 🛠️

This document outlines all technologies, frameworks, and libraries used in the Geopardy project.

## Core Technologies

### Framework: Next.js 15

**Version**: `^15.2.3`

Next.js is the React framework powering Geopardy. We use the **App Router** for modern React Server Components and improved routing.

**Key Features Used**:

- App Router (`src/app/` directory)
- Server Components (default)
- Client Components (where interactivity is needed)
- API Routes (for backend functionality)
- Turbopack (for fast development builds)

**Documentation**: [nextjs.org/docs](https://nextjs.org/docs)

---

### Language: TypeScript

**Version**: `^5.8.2`

TypeScript provides static type checking for improved code quality and developer experience.

**Configuration**: See `tsconfig.json` for compiler options.

**Documentation**: [typescriptlang.org](https://www.typescriptlang.org/)

---

### Database: PostgreSQL

PostgreSQL is our relational database for storing:

- Categories and questions
- Player scores and game state
- Media references
- User data (if applicable)

**Why PostgreSQL?**

- Robust and reliable
- Excellent JSON support for flexible data
- Strong ecosystem and tooling
- Scalable for production use

**Documentation**: [postgresql.org/docs](https://www.postgresql.org/docs/)

---

### ORM: Drizzle

**Version**: `^0.41.0`

Drizzle ORM provides type-safe database access with excellent TypeScript integration.

**Related Packages**:

- `drizzle-orm`: Core ORM functionality
- `drizzle-kit`: CLI tools for migrations and studio
- `postgres`: PostgreSQL driver

**Key Features**:

- Type-safe queries
- Schema-first approach
- Migration generation
- Drizzle Studio for database management

**Documentation**: [orm.drizzle.team](https://orm.drizzle.team/)

---

### Styling: Tailwind CSS 4

**Version**: `^4.0.15`

Tailwind CSS is our utility-first CSS framework for styling.

**Key Features**:

- Utility-first approach
- JIT (Just-in-Time) compilation
- Responsive design utilities
- Dark mode support
- Custom design system configuration

**Documentation**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

### UI Components: shadcn/ui

shadcn/ui provides beautifully designed, accessible components built on Radix UI primitives.

**Key Characteristics**:

- Not a component library - components are copied into your project
- Full customization control
- Built with Radix UI for accessibility
- Styled with Tailwind CSS
- TypeScript support

**Documentation**: [ui.shadcn.com](https://ui.shadcn.com/)

---

## Supporting Libraries

### Environment Validation: @t3-oss/env-nextjs

**Version**: `^0.12.0`

Type-safe environment variable validation using Zod schemas.

**Benefits**:

- Runtime validation of environment variables
- Type inference for env vars
- Fails fast on misconfiguration

---

### Schema Validation: Zod

**Version**: `^3.24.2`

Runtime type checking and validation library.

**Use Cases**:

- Environment variable validation
- Form input validation
- API request/response validation

---

### React

**Version**: `^19.0.0`

The latest React with concurrent features and improved performance.

---

## Development Tools

### Code Quality

| Tool       | Version   | Purpose                       |
| ---------- | --------- | ----------------------------- |
| ESLint     | `^9.23.0` | JavaScript/TypeScript linting |
| Prettier   | `^3.5.3`  | Code formatting               |
| TypeScript | `^5.8.2`  | Static type checking          |

### ESLint Plugins

- `eslint-config-next`: Next.js specific rules
- `eslint-plugin-drizzle`: Drizzle ORM best practices
- `typescript-eslint`: TypeScript ESLint support

### Prettier Plugins

- `prettier-plugin-tailwindcss`: Automatic Tailwind class sorting

---

## Build & Development

### Package Manager: pnpm

**Version**: `10.12.1`

Fast, disk space efficient package manager.

**Commands**:

```bash
pnpm install     # Install dependencies
pnpm add <pkg>   # Add a package
pnpm remove <pkg> # Remove a package
```

### Build Tool: Next.js with Turbopack

Turbopack is enabled for development (`next dev --turbo`) for faster hot module replacement.

---

## Project Foundation

This project was bootstrapped with **create-t3-app** (v7.40.0), which provides:

- Opinionated project structure
- Best practices configuration
- Type-safe full-stack development

---

## Version Summary

```json
{
  "next": "^15.2.3",
  "react": "^19.0.0",
  "typescript": "^5.8.2",
  "drizzle-orm": "^0.41.0",
  "tailwindcss": "^4.0.15",
  "zod": "^3.24.2"
}
```

---

_All versions are specified in `package.json`. Run `pnpm update` to update to latest compatible versions._
