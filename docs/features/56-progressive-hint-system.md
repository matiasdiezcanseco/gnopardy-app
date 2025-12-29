# Feature 56: Progressive Hint System

## Overview

This feature allows game hosts to release additional clues/hints during a question to provide more context and help players arrive at the correct answer. Each question can have multiple progressive hints (additional audio clips, images, videos, or text) that can be revealed on-demand during gameplay.

## User Story

**As a game host**, I want to provide progressive hints during a question so that players have additional context to help them answer correctly, making the game more accessible and engaging.

## Requirements

### Functional Requirements

1. **Database Schema**
   - Add `questionHints` table to store multiple hints per question
   - Each hint has: type (audio, video, image, text), mediaUrl, order, and description
   - Hints are ordered sequentially (1, 2, 3, etc.)

2. **Admin Management**
   - Add hints when creating/editing questions
   - Support multiple hint types: audio, video, image, text
   - Set hint order and descriptions
   - Upload media files for hints
   - Preview hints before saving
   - Delete/reorder hints

3. **Question Display**
   - Show "Reveal Hint" button when hints are available
   - Display hint counter (e.g., "Hint 1 of 3 available")
   - Reveal hints sequentially (must reveal hint 1 before hint 2)
   - Display revealed hints alongside the main question
   - Hints persist when switching players (inline switching)
   - Visual distinction between main question and hints

4. **Hint Types**
   - **Audio Hint**: Additional audio clip with its own player controls
   - **Video Hint**: Additional video clip with its own player controls
   - **Image Hint**: Additional image with zoom capability
   - **Text Hint**: Additional text clue displayed in a card

5. **State Management**
   - Track which hints have been revealed per question per game
   - Persist hint reveal state across player switches
   - Reset hint state when question is answered correctly
   - Store hint reveal history for statistics

### UI/UX Requirements

1. **Hint Button Placement**: Below the main question media, above answer input
2. **Visual Design**:
   - Distinctive hint cards with different styling from main question
   - Progressive reveal animation
   - Clear labeling (Hint 1, Hint 2, etc.)
3. **Responsive**: Works on desktop and mobile devices
4. **Accessibility**: Proper ARIA labels and keyboard navigation
5. **Loading States**: Show loading indicator when revealing hints

## Implementation

### Database Schema

#### `questionHints` Table

**Location**: `src/server/db/schema.ts`

```typescript
export const questionHints = createTable(
  "question_hint",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    questionId: d
      .integer()
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    type: d.varchar({ length: 50 }).notNull(), // audio, video, image, text
    mediaUrl: d.text(), // URL for audio/video/image, null for text
    textContent: d.text(), // Text content for text hints
    order: d.integer().notNull(), // Sequential order (1, 2, 3...)
    description: d.varchar({ length: 256 }), // Optional description
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [
    index("question_hint_question_idx").on(t.questionId),
    index("question_hint_order_idx").on(t.questionId, t.order),
  ],
);

export type QuestionHint = typeof questionHints.$inferSelect;
export type NewQuestionHint = typeof questionHints.$inferInsert;
```

#### `gameQuestionHints` Table (Tracking Revealed Hints)

```typescript
export const gameQuestionHints = createTable(
  "game_question_hint",
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
    hintId: d
      .integer()
      .references(() => questionHints.id, { onDelete: "cascade" })
      .notNull(),
    revealedAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [
    index("game_question_hint_game_idx").on(t.gameId),
    index("game_question_hint_question_idx").on(t.questionId),
    index("game_question_hint_composite_idx").on(
      t.gameId,
      t.questionId,
      t.hintId,
    ),
  ],
);

export type GameQuestionHint = typeof gameQuestionHints.$inferSelect;
export type NewGameQuestionHint = typeof gameQuestionHints.$inferInsert;
```

### Server Actions

#### Hint CRUD Actions

**File**: `src/server/actions/hint.ts`

```typescript
"use server";

import { db } from "~/server/db";
import { questionHints, gameQuestionHints } from "~/server/db/schema";
import { eq, and, asc } from "drizzle-orm";
import type { ActionResult } from "./types";
import type {
  QuestionHint,
  NewQuestionHint,
  GameQuestionHint,
} from "~/server/db/schema";

// Get all hints for a question
export async function getHintsByQuestionId(
  questionId: number,
): Promise<ActionResult<QuestionHint[]>> {
  try {
    const hints = await db
      .select()
      .from(questionHints)
      .where(eq(questionHints.questionId, questionId))
      .orderBy(asc(questionHints.order));

    return { success: true, data: hints };
  } catch (error) {
    console.error("Error fetching hints:", error);
    return { success: false, error: "Failed to fetch hints" };
  }
}

// Create a new hint
export async function createHint(
  hint: NewQuestionHint,
): Promise<ActionResult<QuestionHint>> {
  try {
    const [newHint] = await db.insert(questionHints).values(hint).returning();

    if (!newHint) {
      return { success: false, error: "Failed to create hint" };
    }

    return { success: true, data: newHint };
  } catch (error) {
    console.error("Error creating hint:", error);
    return { success: false, error: "Failed to create hint" };
  }
}

// Update a hint
export async function updateHint(
  id: number,
  hint: Partial<NewQuestionHint>,
): Promise<ActionResult<QuestionHint>> {
  try {
    const [updatedHint] = await db
      .update(questionHints)
      .set(hint)
      .where(eq(questionHints.id, id))
      .returning();

    if (!updatedHint) {
      return { success: false, error: "Hint not found" };
    }

    return { success: true, data: updatedHint };
  } catch (error) {
    console.error("Error updating hint:", error);
    return { success: false, error: "Failed to update hint" };
  }
}

// Delete a hint
export async function deleteHint(id: number): Promise<ActionResult<void>> {
  try {
    await db.delete(questionHints).where(eq(questionHints.id, id));
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting hint:", error);
    return { success: false, error: "Failed to delete hint" };
  }
}

// Get revealed hints for a question in a game
export async function getRevealedHints(
  gameId: number,
  questionId: number,
): Promise<ActionResult<number[]>> {
  try {
    const revealed = await db
      .select({ hintId: gameQuestionHints.hintId })
      .from(gameQuestionHints)
      .where(
        and(
          eq(gameQuestionHints.gameId, gameId),
          eq(gameQuestionHints.questionId, questionId),
        ),
      );

    const hintIds = revealed.map((r) => r.hintId);
    return { success: true, data: hintIds };
  } catch (error) {
    console.error("Error fetching revealed hints:", error);
    return { success: false, error: "Failed to fetch revealed hints" };
  }
}

// Reveal a hint
export async function revealHint(
  gameId: number,
  questionId: number,
  hintId: number,
): Promise<ActionResult<GameQuestionHint>> {
  try {
    // Check if hint is already revealed
    const existing = await db
      .select()
      .from(gameQuestionHints)
      .where(
        and(
          eq(gameQuestionHints.gameId, gameId),
          eq(gameQuestionHints.questionId, questionId),
          eq(gameQuestionHints.hintId, hintId),
        ),
      );

    if (existing.length > 0) {
      return { success: false, error: "Hint already revealed" };
    }

    // Reveal the hint
    const [revealed] = await db
      .insert(gameQuestionHints)
      .values({ gameId, questionId, hintId })
      .returning();

    if (!revealed) {
      return { success: false, error: "Failed to reveal hint" };
    }

    return { success: true, data: revealed };
  } catch (error) {
    console.error("Error revealing hint:", error);
    return { success: false, error: "Failed to reveal hint" };
  }
}
```

### Components

#### `HintDisplay.tsx`

**Location**: `src/components/question/HintDisplay.tsx`

**Description**: Displays a single hint with appropriate media player or text.

```typescript
"use client";

import { AudioPlayer } from "./AudioPlayer";
import { VideoPlayer } from "./VideoPlayer";
import { ImageDisplay } from "./ImageDisplay";
import { cn } from "~/lib/utils";
import type { QuestionHint } from "~/server/db/schema";

interface HintDisplayProps {
  hint: QuestionHint;
  hintNumber: number;
  className?: string;
}

export function HintDisplay({ hint, hintNumber, className }: HintDisplayProps) {
  const renderHintMedia = () => {
    switch (hint.type) {
      case "audio":
        return hint.mediaUrl ? <AudioPlayer src={hint.mediaUrl} /> : null;
      case "video":
        return hint.mediaUrl ? <VideoPlayer src={hint.mediaUrl} /> : null;
      case "image":
        return hint.mediaUrl ? (
          <ImageDisplay src={hint.mediaUrl} alt={`Hint ${hintNumber}`} />
        ) : null;
      case "text":
        return (
          <p className="text-base text-foreground leading-relaxed">
            {hint.textContent}
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border-2 border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-md",
        "animate-in slide-in-from-top-2 duration-300",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-sm">
          {hintNumber}
        </div>
        <h4 className="font-semibold text-amber-900 dark:text-amber-100">
          Hint {hintNumber}
          {hint.description && ` - ${hint.description}`}
        </h4>
      </div>
      <div className="mt-2">{renderHintMedia()}</div>
    </div>
  );
}
```

#### `HintSystem.tsx`

**Location**: `src/components/question/HintSystem.tsx`

**Description**: Main component managing hint reveal and display.

```typescript
"use client";

import { useState, useTransition } from "react";
import { Button } from "~/components/ui/button";
import { HintDisplay } from "./HintDisplay";
import { revealHint } from "~/server/actions/hint";
import type { QuestionHint } from "~/server/db/schema";

interface HintSystemProps {
  hints: QuestionHint[];
  revealedHintIds: number[];
  gameId: number;
  questionId: number;
  onHintRevealed?: (hintId: number) => void;
}

export function HintSystem({
  hints,
  revealedHintIds: initialRevealedIds,
  gameId,
  questionId,
  onHintRevealed,
}: HintSystemProps) {
  const [isPending, startTransition] = useTransition();
  const [revealedHintIds, setRevealedHintIds] = useState<number[]>(initialRevealedIds);
  const [error, setError] = useState<string | null>(null);

  if (hints.length === 0) {
    return null;
  }

  // Sort hints by order
  const sortedHints = [...hints].sort((a, b) => a.order - b.order);

  // Get revealed hints
  const revealedHints = sortedHints.filter((hint) =>
    revealedHintIds.includes(hint.id)
  );

  // Get next hint to reveal
  const nextHint = sortedHints.find((hint) => !revealedHintIds.includes(hint.id));

  const handleRevealHint = () => {
    if (!nextHint) return;

    setError(null);
    startTransition(async () => {
      const result = await revealHint(gameId, questionId, nextHint.id);

      if (result.success) {
        setRevealedHintIds((prev) => [...prev, nextHint.id]);
        onHintRevealed?.(nextHint.id);
      } else {
        setError(result.error || "Failed to reveal hint");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Revealed Hints */}
      {revealedHints.length > 0 && (
        <div className="space-y-3">
          {revealedHints.map((hint, index) => (
            <HintDisplay
              key={hint.id}
              hint={hint}
              hintNumber={index + 1}
            />
          ))}
        </div>
      )}

      {/* Reveal Next Hint Button */}
      {nextHint && (
        <div className="flex flex-col items-center gap-2">
          {error && (
            <div className="w-full rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Button
            onClick={handleRevealHint}
            disabled={isPending}
            variant="outline"
            className="border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 mr-2"
            >
              <path d="M12 .75a8.25 8.25 0 00-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 00.577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 01-.937-.171.75.75 0 11.374-1.453 5.261 5.261 0 002.626 0 .75.75 0 11.374 1.453 6.714 6.714 0 01-.937.17v4.662c0 .326.277.585.6.544.364-.047.722-.112 1.074-.195a.75.75 0 00.577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0012 .75z" />
              <path
                fillRule="evenodd"
                d="M9.013 19.9a.75.75 0 01.877-.597 11.319 11.319 0 004.22 0 .75.75 0 11.28 1.473 12.819 12.819 0 01-4.78 0 .75.75 0 01-.597-.876zM9.754 22.344a.75.75 0 01.824-.668 13.682 13.682 0 002.844 0 .75.75 0 11.156 1.492 15.156 15.156 0 01-3.156 0 .75.75 0 01-.668-.824z"
                clipRule="evenodd"
              />
            </svg>
            Reveal Hint {revealedHints.length + 1} of {hints.length}
          </Button>
        </div>
      )}

      {/* All Hints Revealed Message */}
      {!nextHint && revealedHints.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          All hints revealed ({revealedHints.length} of {hints.length})
        </div>
      )}
    </div>
  );
}
```

### Integration

#### Update Question Page Client

**File**: `src/app/question/[id]/client.tsx`

Add hint system to the question display:

```typescript
// Add to imports
import { HintSystem } from "~/components/question/HintSystem";
import type { QuestionHint } from "~/server/db/schema";

// Add to props interface
interface QuestionPageClientProps {
  question: QuestionWithCategory;
  answers: Answer[];
  player: Player;
  allPlayers: Player[];
  gameId: number;
  hints: QuestionHint[];           // NEW
  revealedHintIds: number[];       // NEW
}

// Add to component
export function QuestionPageClient({
  question,
  answers,
  player: initialPlayer,
  allPlayers: initialAllPlayers,
  gameId,
  hints,                            // NEW
  revealedHintIds: initialRevealedHintIds, // NEW
}: QuestionPageClientProps) {
  // Add state for revealed hints
  const [revealedHintIds, setRevealedHintIds] = useState<number[]>(initialRevealedHintIds);

  // Add callback for hint revealed
  const handleHintRevealed = (hintId: number) => {
    setRevealedHintIds((prev) => [...prev, hintId]);
  };

  // In the render, add HintSystem between QuestionView and answer input:
  return (
    // ... existing code ...
    <div className="space-y-8">
      <QuestionView question={question} category={question.category} />

      {/* NEW: Hint System */}
      <HintSystem
        hints={hints}
        revealedHintIds={revealedHintIds}
        gameId={gameId}
        questionId={question.id}
        onHintRevealed={handleHintRevealed}
      />

      <div className="rounded-xl border bg-card p-8 shadow-md">
        {/* ... existing answer input code ... */}
      </div>
    </div>
    // ... existing code ...
  );
}
```

#### Update Question Page Server

**File**: `src/app/question/[id]/page.tsx`

Fetch hints data:

```typescript
// Add to imports
import { getHintsByQuestionId, getRevealedHints } from "~/server/actions/hint";

// In the server component, fetch hints
const [
  questionResult,
  answersResult,
  playerResult,
  allPlayersResult,
  answeredResult,
  hintsResult,           // NEW
  revealedHintsResult,   // NEW
] = await Promise.all([
  getQuestionById(questionId),
  getAnswersByQuestionId(questionId),
  getPlayerById(playerIdNum),
  getPlayersByGameId(gameIdNum),
  isQuestionAnsweredInGame(gameIdNum, questionId),
  getHintsByQuestionId(questionId),                    // NEW
  getRevealedHints(gameIdNum, questionId),             // NEW
]);

// Extract data
const hints = hintsResult.success ? hintsResult.data : [];
const revealedHintIds = revealedHintsResult.success ? revealedHintsResult.data : [];

// Pass to client
return (
  <QuestionPageClient
    question={question}
    answers={answers}
    player={player}
    allPlayers={allPlayers}
    gameId={gameIdNum}
    hints={hints}                    // NEW
    revealedHintIds={revealedHintIds} // NEW
  />
);
```

#### Admin Question Management

**File**: `src/app/admin/questions/page.tsx`

Add hint management UI in the question form:

- Add "Hints" section with list of current hints
- Add button to add new hint
- For each hint: type selector, media upload/text input, description, order
- Delete and reorder buttons
- Preview hints

### Database Migration

Create migration file to add new tables:

```sql
-- Add question_hints table
CREATE TABLE "jeopardy-app_question_hint" (
  "id" INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "question_id" INTEGER NOT NULL REFERENCES "jeopardy-app_question"("id") ON DELETE CASCADE,
  "type" VARCHAR(50) NOT NULL,
  "media_url" TEXT,
  "text_content" TEXT,
  "order" INTEGER NOT NULL,
  "description" VARCHAR(256),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX "question_hint_question_idx" ON "jeopardy-app_question_hint"("question_id");
CREATE INDEX "question_hint_order_idx" ON "jeopardy-app_question_hint"("question_id", "order");

-- Add game_question_hints table
CREATE TABLE "jeopardy-app_game_question_hint" (
  "id" INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "game_id" INTEGER NOT NULL REFERENCES "jeopardy-app_game"("id") ON DELETE CASCADE,
  "question_id" INTEGER NOT NULL REFERENCES "jeopardy-app_question"("id") ON DELETE CASCADE,
  "hint_id" INTEGER NOT NULL REFERENCES "jeopardy-app_question_hint"("id") ON DELETE CASCADE,
  "revealed_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX "game_question_hint_game_idx" ON "jeopardy-app_game_question_hint"("game_id");
CREATE INDEX "game_question_hint_question_idx" ON "jeopardy-app_game_question_hint"("question_id");
CREATE INDEX "game_question_hint_composite_idx" ON "jeopardy-app_game_question_hint"("game_id", "question_id", "hint_id");
```

## User Flow

### Basic Flow

1. **Question Display**
   - Player views question with main clue (audio, video, image, or text)
   - If hints are available, "Reveal Hint 1 of X" button appears below question

2. **Reveal First Hint**
   - Host clicks "Reveal Hint 1"
   - First hint appears with animation
   - Button updates to "Reveal Hint 2 of X" (if more hints available)

3. **Progressive Reveal**
   - Host can continue revealing hints sequentially
   - Each hint displays with its own media player or text
   - All revealed hints remain visible

4. **Answer Question**
   - Player can answer at any time (with or without revealing hints)
   - Revealed hints persist if answer is incorrect and another player tries

5. **Next Question**
   - When question is answered correctly, hint state resets
   - New question starts with no hints revealed

### Example Scenario: Audio Question with Progressive Hints

**Main Question**: "Identify this song" (2-second audio clip)

**Hint 1**: 4-second audio clip (more of the song)
**Hint 2**: Image of the album cover
**Hint 3**: Text hint: "Released in 1982 by Michael Jackson"

1. Players hear 2-second clip
2. If stuck, host reveals Hint 1 (4-second clip)
3. Still stuck? Reveal Hint 2 (album cover)
4. Final hint reveals text clue
5. Player answers correctly

## Validation

### Client-Side Validation

1. **Sequential Reveal**: Can only reveal next hint in sequence
2. **Already Revealed**: Cannot reveal same hint twice
3. **Hint Availability**: Button disabled when no more hints available

### Server-Side Validation

1. **Hint Exists**: Verify hint ID exists for question
2. **Not Already Revealed**: Check hint not already revealed in game
3. **Question Active**: Verify question is still active in game

## Accessibility

1. **Keyboard Navigation**: All hint buttons keyboard accessible
2. **Screen Readers**:
   - Announce when hint is revealed
   - Describe hint type and number
   - ARIA labels for all controls
3. **Visual**:
   - High contrast hint cards
   - Clear numbering
   - Distinct styling from main question

## Testing Scenarios

### Manual Testing

1. **Single Hint**:
   - Create question with 1 hint
   - Reveal hint
   - Verify display and button disappears

2. **Multiple Hints**:
   - Create question with 3 hints (audio, image, text)
   - Reveal sequentially
   - Verify order and display

3. **Persistence**:
   - Reveal hint 1
   - Switch players (inline switching)
   - Verify hint 1 still visible

4. **Answer with Hints**:
   - Reveal 2 hints
   - Answer correctly
   - Go to next question
   - Verify hints reset

5. **Different Media Types**:
   - Test audio hint with player controls
   - Test video hint with player controls
   - Test image hint with zoom
   - Test text hint display

6. **Error Handling**:
   - Test with invalid hint ID
   - Test with network error
   - Verify error messages

## Use Cases

1. **Audio Clues**: Short clip → Longer clip → Visual hint → Text hint
2. **Visual Puzzles**: Zoomed image → Wider view → Context image → Text hint
3. **Trivia**: Vague clue → More specific → Very specific → Answer category
4. **Geography**: Satellite view → Street view → Landmark → Country name
5. **Music**: Instrumental → With lyrics → Album art → Artist name

## Future Enhancements

1. **Timed Hints**: Automatically reveal hints after time intervals
2. **Point Deduction**: Reduce points for each hint revealed
3. **Hint Categories**: Group hints by difficulty level
4. **Hint Statistics**: Track which hints are most helpful
5. **Hint Templates**: Predefined hint sequences for common question types
6. **Collaborative Hints**: Players vote to reveal next hint
7. **Custom Hint Animations**: Different reveal animations per hint type

## Related Features

- **Feature 14**: Audio Player Component (used for audio hints)
- **Feature 15**: Video Player Component (used for video hints)
- **Feature 16**: Image Display Component (used for image hints)
- **Feature 37**: Media Upload Functionality (used for uploading hint media)
- **Feature 53**: Inline Player Switching (hints persist across player switches)

## Benefits

1. **Accessibility**: Makes difficult questions more approachable
2. **Engagement**: Keeps players engaged with progressive reveals
3. **Flexibility**: Host controls pacing and difficulty
4. **Learning**: Educational value with layered information
5. **Inclusivity**: Accommodates different skill levels
6. **Variety**: Supports multiple media types for rich hints

## Current Implementation Status

### ✅ Completed

- Database schema with `questionHints` and `gameQuestionHints` tables
- Server actions for hint CRUD operations and reveal tracking
- `HintDisplay` component for rendering individual hints
- `HintSystem` component for progressive hint reveal
- Integration with question page (display and reveal)
- Database migration applied
- **Admin UI for hint management fully integrated**
- Full integration with admin question form

### Alternative Methods

You can also add hints directly to the database if needed:

```sql
-- Example: Add a text hint
INSERT INTO "jeopardy-app_question_hint" (question_id, type, text_content, "order", description)
VALUES (1, 'text', 'This song was released in 1982', 1, 'Year hint');

-- Example: Add an audio hint
INSERT INTO "jeopardy-app_question_hint" (question_id, type, media_url, "order", description)
VALUES (1, 'audio', '/uploads/audio/longer-clip.mp3', 2, 'Longer audio clip');

-- Example: Add an image hint
INSERT INTO "jeopardy-app_question_hint" (question_id, type, media_url, "order", description)
VALUES (1, 'image', '/uploads/image/album-cover.png', 3, 'Album cover');
```

---

**Status**: ✅ Fully Implemented  
**Last Updated**: December 29, 2025
