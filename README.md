# Jeopardy 🎯

A modern, interactive Jeopardy-style trivia game built with Next.js, featuring categories, multimedia questions, and real-time scoring.

## 🎮 What is Jeopardy?

Jeopardy is a web-based trivia game inspired by the classic TV show Jeopardy. Players can:

- **Browse Categories**: View a dashboard with multiple trivia categories
- **Answer Questions**: Select questions of varying difficulty and point values
- **Experience Multimedia**: Watch videos, listen to audio clips, or view images as part of questions
- **Track Scores**: Earn points for correct answers with automatic score tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 10+
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd jeopardy-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to start playing!

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](./docs) folder:

| Document                                                 | Description                               |
| -------------------------------------------------------- | ----------------------------------------- |
| [Project Overview](./docs/PROJECT_OVERVIEW.md)           | Detailed project description and features |
| [Tech Stack](./docs/TECH_STACK.md)                       | Technologies and libraries used           |
| [Database](./docs/DATABASE.md)                           | Database schema and Drizzle ORM guide     |
| [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md) | Configuration and environment setup       |
| [Styling](./docs/STYLING.md)                             | Tailwind CSS styling guidelines           |
| [Components](./docs/COMPONENTS.md)                       | shadcn/ui component library usage         |
| [Folder Structure](./docs/FOLDER_STRUCTURE.md)           | Project organization and architecture     |

## 🛠️ Available Scripts

| Command            | Description                                 |
| ------------------ | ------------------------------------------- |
| `pnpm dev`         | Start development server with Turbo         |
| `pnpm build`       | Build for production                        |
| `pnpm start`       | Start production server                     |
| `pnpm check`       | Run linting and type checking               |
| `pnpm db:push`     | Push schema changes to database             |
| `pnpm db:studio`   | Open Drizzle Studio for database management |
| `pnpm db:generate` | Generate database migrations                |
| `pnpm db:migrate`  | Run database migrations                     |

## 🏗️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 📄 License

This project is private and not licensed for public use.

---

Built with ❤️ using the [T3 Stack](https://create.t3.gg/)
