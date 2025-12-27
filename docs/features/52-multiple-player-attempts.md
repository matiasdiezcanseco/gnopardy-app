# Feature: Multiple Player Attempts Per Question

## Overview

Allows multiple players to attempt the same question until someone answers it correctly. When a player answers incorrectly, they lose points, but the question remains available for other players to answer. This creates a more dynamic and competitive gameplay experience similar to traditional Jeopardy.

## Implementation Details

### Behavior Changes

Previously, when any player submitted an answer (correct or incorrect), the question was immediately marked as answered and became unavailable to other players.

**New Behavior:**
- When a player answers **incorrectly**, they lose points but the question remains open
- Other players can then attempt to answer the same question
- When a player answers **correctly**, they gain points and the question is marked as answered
- Once answered correctly, the question becomes unavailable to all players
- Each player can only attempt each question once (no multiple attempts by the same player)

### Database Schema

The implementation leverages the existing `answerHistory` table to track player attempts:

```typescript
export const answerHistory = createTable("answer_history", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  gameId: d.integer().references(() => games.id).notNull(),
  playerId: d.integer().references(() => players.id).notNull(),
  questionId: d.integer().references(() => questions.id).notNull(),
  isCorrect: d.boolean().notNull(),
  pointsEarned: d.integer().notNull(),
  submittedAnswer: d.text(),
  answeredAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));
```

This table records:
- Which player attempted which question
- Whether the attempt was correct or incorrect
- How many points were earned/lost
- What answer was submitted
- When the attempt was made

### Server Action Updates

**File**: `src/server/actions/history.ts`

Added a new function `hasPlayerAttemptedQuestion` that checks if a player has already attempted a specific question:

```typescript
export async function hasPlayerAttemptedQuestion(
  gameId: number,
  playerId: number,
  questionId: number
): Promise<ActionResult<boolean>>;
```

This function queries the `answerHistory` table to determine if a record exists for the given game, player, and question combination.

### Client Component Updates

**File**: `src/app/question/[id]/client.tsx`

Updated all three answer submission handlers:
- `handleTextSubmit` - for text-based questions
- `handleMultipleChoiceSubmit` - for multiple choice questions
- `handleManualOverride` - for host manual overrides

Each handler now follows this flow:

1. **Check if player already attempted**: Call `hasPlayerAttemptedQuestion()` to verify the player hasn't already answered this question
2. **Validate the answer**: Call the appropriate validation function
3. **Update player score**: Add or subtract points based on correctness
4. **Record attempt in history**: Log the attempt in `answerHistory` table
5. **Conditionally mark as answered**: Only call `markQuestionAsAnsweredInGame()` if the answer is correct
6. **Show feedback**: Display the result to the player

### User Flow

#### Scenario: Player 1 Answers Incorrectly

1. Player 1 navigates to a 200-point question
2. Player 1 submits an incorrect answer
3. System validates the answer (incorrect)
4. Player 1's score decreases by 200 points
5. The attempt is recorded in `answerHistory`
6. The question is **NOT** marked as answered
7. Player 1 sees feedback showing the incorrect answer
8. Player 1 returns to the game board
9. The question is still visible and clickable for other players

#### Scenario: Player 2 Answers Correctly After Player 1 Failed

1. Player 2 sees the same question is still available
2. Player 2 navigates to the question
3. Player 2 submits the correct answer
4. System validates the answer (correct)
5. Player 2's score increases by 200 points
6. The attempt is recorded in `answerHistory`
7. The question is marked as answered (now unavailable)
8. Player 2 sees feedback showing success
9. Player 2 returns to the game board
10. The question now appears as answered to all players

#### Scenario: Player 1 Tries to Answer Again

1. Player 1 already attempted the question (incorrectly)
2. Player 1 tries to navigate to the question again
3. System checks `hasPlayerAttemptedQuestion()` returns true
4. Player 1 sees error message: "You have already attempted this question. Let another player try!"
5. Player 1 cannot submit another answer

### Benefits

- **More Competitive**: Multiple players can compete for the same question
- **Strategic Gameplay**: Players must decide whether to risk losing points
- **Fair Opportunity**: Everyone gets one chance to answer each question
- **Authentic Experience**: Mirrors traditional Jeopardy rules where buzzing in incorrectly doesn't end the question
- **Better Tracking**: Complete history of who attempted what and when

### Technical Notes

- The check for previous attempts happens **before** answer validation to prevent wasted processing
- All attempts (correct and incorrect) are recorded in the `answerHistory` table
- The `gameQuestions` table's `isAnswered` field is only set to true when someone answers correctly
- Score updates happen immediately, maintaining consistency
- Manual override functionality respects the same rules (one attempt per player)
- Answer history is preserved for statistics and leaderboard calculations

## Code Changes Summary

### New Functions
- `hasPlayerAttemptedQuestion()` in `src/server/actions/history.ts`

### Modified Functions
- `handleTextSubmit()` in `src/app/question/[id]/client.tsx`
- `handleMultipleChoiceSubmit()` in `src/app/question/[id]/client.tsx`
- `handleManualOverride()` in `src/app/question/[id]/client.tsx`

### Database Tables Used
- `answerHistory` - tracks all player attempts
- `gameQuestions` - marks questions as answered only when correct answer is given

## Testing Scenarios

### Test Case 1: Single Player, Single Incorrect Attempt
1. Start a game with one player
2. Answer a question incorrectly
3. Verify score decreases
4. Verify question remains clickable
5. Verify attempt is recorded in history
6. Verify player cannot attempt the same question again

### Test Case 2: Multiple Players, All Incorrect
1. Start a game with 3 players
2. Player 1 answers incorrectly → loses points, question remains open
3. Player 2 answers incorrectly → loses points, question remains open
4. Player 3 answers incorrectly → loses points, question remains open
5. Verify all 3 attempts are recorded
6. Verify question is still not marked as answered (remains clickable for new players)

### Test Case 3: Multiple Players, Eventually Correct
1. Start a game with 3 players
2. Player 1 answers incorrectly → loses points
3. Player 2 answers correctly → gains points, question marked as answered
4. Verify Player 3 cannot access the question anymore
5. Verify question is marked as answered on game board
6. Verify both attempts are recorded in history

### Test Case 4: Duplicate Attempt Prevention
1. Player 1 attempts a question
2. Player 1 tries to attempt the same question again
3. Verify error message is displayed
4. Verify no second attempt is recorded
5. Verify score does not change

## Future Enhancements

Potential improvements could include:

- **Partial Points**: Award partial points for incorrect attempts (e.g., -100 instead of full -200)
- **Time Limit Between Attempts**: Add a cooldown before another player can attempt after an incorrect answer
- **Daily Double Behavior**: Special handling for Daily Double questions (traditional rule: if incorrect, no one else can attempt)
- **Answer Reveal Options**: Option to reveal correct answer after X incorrect attempts
- **Attempt Counter Display**: Show how many players have attempted the question
- **Admin View**: Dashboard showing attempt history for each question in real-time

## Migration Notes

This feature requires no database migration as it uses existing tables (`answerHistory` and `gameQuestions`). However, existing games may need to be reset to ensure the answer history is properly tracked from the start.

For existing games:
- Questions answered before this update will remain marked as answered
- New questions or reset games will follow the new behavior
- Consider resetting active games after deploying this update for consistent behavior

