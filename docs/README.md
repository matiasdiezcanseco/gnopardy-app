# Geopardy Documentation 📖

Welcome to the Geopardy documentation! This folder contains all the information you need to understand, develop, and maintain the project.

## 📑 Documentation Index

### Core Documentation

| Document                                  | Description                                                |
| ----------------------------------------- | ---------------------------------------------------------- |
| [Project Overview](./PROJECT_OVERVIEW.md) | Complete project description, features, and game mechanics |
| [Tech Stack](./TECH_STACK.md)             | All technologies, frameworks, and libraries used           |
| [Folder Structure](./FOLDER_STRUCTURE.md) | Project organization and file structure explained          |

### Technical Guides

| Document                                            | Description                                             |
| --------------------------------------------------- | ------------------------------------------------------- |
| [Database](./DATABASE.md)                           | PostgreSQL setup, Drizzle ORM, and schema documentation |
| [Environment Variables](./ENVIRONMENT_VARIABLES.md) | Required configuration and environment setup            |
| [Styling](./STYLING.md)                             | Tailwind CSS conventions and design system              |
| [Components](./COMPONENTS.md)                       | shadcn/ui component library and usage patterns          |

## 🎯 Quick Reference

### Development Commands

```bash
# Start development
pnpm dev

# Database management
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations

# Code quality
pnpm check        # Lint + type check
pnpm format:write # Format code
```

### Key Directories

```
src/
├── app/          # Next.js App Router pages and layouts
├── server/       # Server-side code (database, API)
│   └── db/       # Drizzle schema and database connection
└── styles/       # Global CSS and Tailwind styles
```

## 🔗 External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [T3 Stack Documentation](https://create.t3.gg/)

## 📝 Contributing to Documentation

When adding new documentation:

1. Create a new markdown file in this `docs/` folder
2. Use clear, descriptive headings
3. Include code examples where applicable
4. Update this README index with a link to the new document
5. Keep documentation up-to-date with code changes

---

_Last updated: December 2024_
