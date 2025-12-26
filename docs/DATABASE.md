# Database Documentation 🗄️

This document covers the PostgreSQL database setup, Drizzle ORM configuration, and schema design for Geopardy.

## Overview

Geopardy uses **PostgreSQL** as its database with **Drizzle ORM** for type-safe database access.

## Database Setup

### Prerequisites

1. PostgreSQL installed locally or a cloud-hosted instance
2. Database URL in your environment variables

### Local Development with Docker

You can use the provided script to start a PostgreSQL container:

```bash
./start-database.sh
```

Or manually with Docker:

```bash
docker run --name geopardy-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=geopardy \
  -p 5432:5432 \
  -d postgres:16
```

### Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Example:

```
postgresql://postgres:password@localhost:5432/geopardy
```

---

## Drizzle ORM

### Configuration

Drizzle is configured in `drizzle.config.ts`:

```typescript
import { type Config } from "drizzle-kit";
import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["jeopardy-app_*"],
} satisfies Config;
```

**Key Points**:

- Schema is defined in `src/server/db/schema.ts`
- All tables are prefixed with `jeopardy-app_` (multi-project schema support)
- Uses the `DATABASE_URL` environment variable

### Database Connection

The database connection is established in `src/server/db/index.ts`:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "~/env";
import * as schema from "./schema";

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema });
```

---

## Database Commands

### Push Schema (Development)

Quickly push schema changes without migrations:

```bash
pnpm db:push
```

**Use Case**: Rapid prototyping during development

### Generate Migrations

Create SQL migration files for schema changes:

```bash
pnpm db:generate
```

**Use Case**: Production-ready schema changes

### Run Migrations

Apply pending migrations to the database:

```bash
pnpm db:migrate
```

### Drizzle Studio

Open the visual database management interface:

```bash
pnpm db:studio
```

This opens a web UI at `https://local.drizzle.studio` for browsing and editing data.

---

## Schema Design

### Table Naming Convention

All tables use a prefix to support multi-project schemas:

```typescript
export const createTable = pgTableCreator((name) => `jeopardy-app_${name}`);
```

### Proposed Schema Structure

The following schema is designed for the Geopardy game:

#### Categories Table

```typescript
export const categories = createTable("category", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 256 }).notNull(),
  description: d.text(),
  color: d.varchar({ length: 7 }), // Hex color code
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));
```

#### Questions Table

```typescript
export const questions = createTable("question", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  categoryId: d
    .integer()
    .references(() => categories.id)
    .notNull(),
  text: d.text().notNull(),
  points: d.integer().notNull(), // 100, 200, 300, 400, 500
  type: d.varchar({ length: 50 }).notNull(), // text, multiple_choice, audio, video, image
  mediaUrl: d.text(), // URL to audio/video/image
  isAnswered: d.boolean().default(false),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));
```

#### Answers Table

```typescript
export const answers = createTable("answer", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  questionId: d
    .integer()
    .references(() => questions.id)
    .notNull(),
  text: d.text().notNull(),
  isCorrect: d.boolean().notNull().default(false),
  order: d.integer(), // For ordering multiple choice options
}));
```

#### Players Table

```typescript
export const players = createTable("player", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 256 }).notNull(),
  score: d.integer().default(0).notNull(),
  gameId: d.integer().references(() => games.id),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));
```

#### Games Table

```typescript
export const games = createTable("game", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 256 }),
  status: d.varchar({ length: 50 }).default("active"), // active, completed
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  completedAt: d.timestamp({ withTimezone: true }),
}));
```

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐
│    Games    │       │  Categories │
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ name        │       │ name        │
│ status      │       │ description │
│ createdAt   │       │ color       │
│ completedAt │       │ createdAt   │
└──────┬──────┘       └──────┬──────┘
       │                     │
       │ 1:N                 │ 1:N
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│   Players   │       │  Questions  │
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ name        │       │ categoryId  │──┐
│ score       │       │ text        │  │
│ gameId      │       │ points      │  │
│ createdAt   │       │ type        │  │
└─────────────┘       │ mediaUrl    │  │
                      │ isAnswered  │  │
                      └──────┬──────┘  │
                             │         │
                             │ 1:N     │
                             ▼         │
                      ┌─────────────┐  │
                      │   Answers   │  │
                      ├─────────────┤  │
                      │ id          │  │
                      │ questionId  │◀─┘
                      │ text        │
                      │ isCorrect   │
                      │ order       │
                      └─────────────┘
```

---

## Best Practices

### Query Patterns

```typescript
import { db } from "~/server/db";
import { categories, questions } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// Select all categories
const allCategories = await db.select().from(categories);

// Select with where clause
const category = await db.select().from(categories).where(eq(categories.id, 1));

// Join tables
const questionsWithCategory = await db
  .select()
  .from(questions)
  .leftJoin(categories, eq(questions.categoryId, categories.id));

// Insert data
await db.insert(categories).values({
  name: "History",
  description: "Historical trivia questions",
});
```

### Type Safety

Drizzle provides full TypeScript inference:

```typescript
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { categories } from "~/server/db/schema";

type Category = InferSelectModel<typeof categories>;
type NewCategory = InferInsertModel<typeof categories>;
```

---

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle PostgreSQL Dialect](https://orm.drizzle.team/docs/get-started-postgresql)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

_Keep the schema documentation updated as the database evolves._
