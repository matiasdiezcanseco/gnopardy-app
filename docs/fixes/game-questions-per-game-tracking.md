# Fix: Game Questions Showing as Complete on New Games

## Problem

When creating a new game, the game board would sometimes immediately show as "complete" with no questions available, even though there were questions in the database. This happened because:

1. **Questions were global** - All games shared the same questions from the `questions` table
2. **The `isAnswered` flag was global** - When a question was answered in Game 1, it was marked as answered globally
3. **Game completion checked globally** - The `checkGameCompletion` function checked if ALL questions in the database were answered, not just questions for that specific game

## Solution

Implemented **per-game question tracking** using a junction table to track which questions are answered in each specific game.

### Changes Made

#### 1. Database Schema (`src/server/db/schema.ts`)

- Added `gameQuestions` junction table that tracks the answered state of each question per game:

```typescript
export const gameQuestions = createTable(
  "game_question",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    gameId: d
      .integer()
      .references(() => games.id, { onDelete: "cascade" })
      .notNull(),
    questionId: d
      .integer()
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    isAnswered: d.boolean().default(false).notNull(),
    answeredAt: d.timestamp({ withTimezone: true }),
  }),
  (t) => [
    index("game_question_game_idx").on(t.gameId),
    index("game_question_question_idx").on(t.questionId),
    index("game_question_composite_idx").on(t.gameId, t.questionId),
  ],
);
```

#### 2. Game Actions (`src/server/actions/game.ts`)

- **`createGame`**: Now initializes all questions in the `game_questions` table when a new game is created
- **`checkGameCompletion`**: Updated to check per-game question status instead of global
- **`resetGame`**: Updated to reset per-game question states
- **Added new functions**:
  - `getGameQuestions(gameId)`: Fetches questions with their per-game answered status
  - `isQuestionAnsweredInGame(gameId, questionId)`: Checks if a specific question is answered in a game
  - `markQuestionAsAnsweredInGame(gameId, questionId)`: Marks a question as answered in a specific game

#### 3. Question Actions (`src/server/actions/question.ts`)

- Marked `markQuestionAsAnswered` and `resetQuestion` as deprecated
- Added comments indicating these functions update globally and should not be used

#### 4. Game Page (`src/app/game/[id]/page.tsx`)

- Updated to use `getGameQuestions(gameId)` instead of `getQuestions()`
- Now fetches questions with per-game answered status

#### 5. Question Page (`src/app/question/[id]/page.tsx` and `client.tsx`)

- Updated to check per-game answered status using `isQuestionAnsweredInGame`
- Updated to mark questions as answered per-game using `markQuestionAsAnsweredInGame`

#### 6. Migration Support

Created migration utilities for existing games:

- **Migration script** (`src/server/actions/migrate-game-questions.ts`): Populates `game_questions` table for existing games
- **Admin page** (`src/app/admin/migrate/page.tsx`): UI to run the migration
- **API route** (`src/app/api/migrate-game-questions/route.ts`): Endpoint to execute migration

## Migration Steps for Existing Installations

If you have existing games in your database, run the migration:

1. Navigate to `/admin/migrate`
2. Click "Run Migration"
3. The migration will:
   - Find all existing games
   - Initialize all questions for each game in the `game_questions` table
   - Skip games that already have entries (safe to run multiple times)

## Benefits

✅ **Each game is independent** - Questions answered in Game 1 don't affect Game 2
✅ **Multiple concurrent games** - Different games can be at different states of completion
✅ **Proper game state** - New games start fresh with all questions unanswered
✅ **Data integrity** - Per-game tracking maintains accurate game state
✅ **Backward compatible** - Existing questions table remains unchanged (isAnswered field kept but deprecated)

## Technical Details

### How It Works

1. **Game Creation**: When a game is created, all questions are copied to `game_questions` with `isAnswered = false`
2. **Question Display**: The game board fetches questions joined with `game_questions` to get per-game answered status
3. **Answering Questions**: When a question is answered, only the `game_questions` entry for that game/question is updated
4. **Game Completion**: Checks if all entries in `game_questions` for that game have `isAnswered = true`

### Database Relationships

```
games (1) ─────┐
               │
               ├─── (M) game_questions (M) ─── questions (1)
               │
               └─── (M) players
```

Each game has many `game_questions` entries (one per question), and each entry tracks whether that specific question is answered in that specific game.
