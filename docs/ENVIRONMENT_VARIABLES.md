# Environment Variables 🔐

This document describes all environment variables required to run the Jeopardy application.

## Overview

Environment variables are validated at build time and runtime using `@t3-oss/env-nextjs` with Zod schemas. This ensures the application fails fast if misconfigured.

## Configuration File

Environment validation is defined in `src/env.js`:

```javascript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {
    // Client-side variables (prefixed with NEXT_PUBLIC_)
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
```

---

## Required Variables

### `DATABASE_URL`

**Type**: `string` (URL format)  
**Required**: ✅ Yes  
**Scope**: Server-side only

The PostgreSQL connection string for the database.

**Format**:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

**Examples**:

```bash
# Local development
DATABASE_URL="postgresql://postgres:password@localhost:5432/jeopardy"

# Docker container
DATABASE_URL="postgresql://postgres:password@localhost:5432/jeopardy"

# Cloud hosted (example with Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Cloud hosted (example with Neon)
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require"
```

---

### `NODE_ENV`

**Type**: `"development" | "test" | "production"`  
**Required**: ❌ No (defaults to `"development"`)  
**Scope**: Server-side only

The current environment mode.

**Values**:
| Value | Description |
|-------|-------------|
| `development` | Local development with hot reloading |
| `test` | Testing environment |
| `production` | Production build and deployment |

---

## Optional Variables

### `SKIP_ENV_VALIDATION`

**Type**: `boolean` (truthy/falsy)  
**Required**: ❌ No  
**Scope**: Build-time

Skip environment variable validation during build. Useful for Docker builds where env vars are injected at runtime.

**Usage**:

```bash
SKIP_ENV_VALIDATION=1 pnpm build
```

---

## Future Variables

As the application grows, additional environment variables may be needed:

### Authentication (if added)

```bash
# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### File Storage (for media uploads)

```bash
# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="jeopardy-media"
AWS_REGION="us-east-1"

# Or Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### Client-Side Variables

```bash
# Public variables (accessible in browser)
NEXT_PUBLIC_APP_URL="https://jeopardy.example.com"
NEXT_PUBLIC_WS_URL="wss://jeopardy.example.com"
```

---

## Setup Instructions

### 1. Create Environment File

Create a `.env` file in the project root:

```bash
# Copy the example file (if it exists)
cp .env.example .env

# Or create manually
touch .env
```

### 2. Add Required Variables

Add at minimum:

```bash
# .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/jeopardy"
```

### 3. Verify Configuration

The application will validate environment variables on startup. If any are missing or invalid, you'll see a clear error message.

---

## Environment File Reference

### `.env` (Local development)

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/jeopardy"

# Environment
NODE_ENV="development"
```

### `.env.production` (Production)

```bash
# Database (use secure credentials)
DATABASE_URL="postgresql://user:secure-password@production-host:5432/jeopardy"

# Environment
NODE_ENV="production"
```

---

## Security Best Practices

1. **Never commit `.env` files** - They should be in `.gitignore`
2. **Use strong passwords** in production DATABASE_URL
3. **Rotate secrets regularly** for authentication keys
4. **Use environment-specific files** (`.env.local`, `.env.production`)
5. **Validate all variables** using the Zod schema in `env.js`

---

## Accessing Environment Variables

### In Server Components / API Routes

```typescript
import { env } from "~/env";

// Type-safe access
const dbUrl = env.DATABASE_URL;
const nodeEnv = env.NODE_ENV;
```

### In Client Components

Only `NEXT_PUBLIC_*` variables are accessible:

```typescript
import { env } from "~/env";

// Only public variables
const appUrl = env.NEXT_PUBLIC_APP_URL;
```

---

## Troubleshooting

### "Invalid environment variables"

The Zod validation failed. Check:

1. All required variables are set
2. Values match expected types (e.g., DATABASE_URL is a valid URL)
3. No typos in variable names

### "Cannot read properties of undefined"

You're trying to access an environment variable that isn't defined in the `env.js` schema. Add it to both `server`/`client` and `runtimeEnv`.

### Docker Build Fails

Use `SKIP_ENV_VALIDATION=1` during build:

```dockerfile
RUN SKIP_ENV_VALIDATION=1 pnpm build
```

---

_Keep this document updated when adding new environment variables._
