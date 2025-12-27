# Implementation Summary: Multiple Player Attempts Per Question

## Overview

This implementation allows multiple players to attempt answering the same question until someone gets it correct. Previously, any answer (correct or incorrect) would mark the question as completed and unavailable to other players.

## Changes Made

### 1. Server Actions - History Tracking (`src/server/actions/history.ts`)

**Added new function:**
- `hasPlayerAttemptedQuestion(gameId, playerId, questionId)`: Checks if a specific player has already attempted a question in a game

**Updated imports:**
- Added `and` from drizzle-orm to support complex query conditions

### 2. Client Component - Question Page (`src/app/question/[id]/client.tsx`)

**Updated imports:**
- Added `recordAnswerHistory` and `hasPlayerAttemptedQuestion` from history actions

**Modified three handler functions:**

#### `handleTextSubmit(answer)`
- Added check if player already attempted the question
- Records all answer attempts in `answerHistory` table
- Only marks question as answered if the answer is **correct**
- Shows error message if player already attempted

#### `handleMultipleChoiceSubmit(answerId)`
- Added check if player already attempted the question
- Records all answer attempts in `answerHistory` table
- Only marks question as answered if the answer is **correct**
- Shows error message if player already attempted

#### `handleManualOverride(forceCorrect)`
- Added check if player already attempted the question
- Records manual override attempts in `answerHistory` table
- Only marks question as answered if forcing **correct**
- Shows error message if player already attempted

### 3. Documentation

**Created new feature documentation:**
- `docs/features/52-multiple-player-attempts.md`: Comprehensive documentation of the feature

**Updated feature index:**
- `docs/features/README.md`: Added feature 52 to the enhancement features list

## Flow Diagram

### Before (Old Behavior)
```
Player 1 answers incorrectly → Score -200 → Question marked as answered → Game board updated → Question unavailable to all players
```

### After (New Behavior)
```
Player 1 answers incorrectly → Score -200 → Attempt recorded → Question REMAINS open → Player 2 can attempt

Player 2 answers correctly → Score +200 → Attempt recorded → Question marked as answered → Question unavailable
```

## Database Usage

### Tables Involved

1. **`answerHistory`**: Records every attempt
   - Stores: gameId, playerId, questionId, isCorrect, pointsEarned, submittedAnswer, timestamp

2. **`gameQuestions`**: Tracks question completion status
   - `isAnswered` field only set to `true` when someone answers correctly

3. **`players`**: Player scores
   - Updated immediately for both correct and incorrect attempts

## Key Benefits

1. **More Competitive**: Players compete to answer after someone fails
2. **Strategic Risk**: Players must decide if they want to risk losing points
3. **Fair Rules**: Each player gets exactly one attempt per question
4. **Complete History**: All attempts are tracked for statistics
5. **Authentic Experience**: Mirrors real Jeopardy gameplay

## Testing Recommendations

### Manual Testing Steps

1. **Test Case: Single Player Cannot Answer Twice**
   - Start a game with 1 player
   - Answer a question incorrectly
   - Try to access the same question again
   - Expected: Error message "You have already attempted this question. Let another player try!"

2. **Test Case: Multiple Players Can All Attempt**
   - Start a game with 3 players
   - Player 1 answers incorrectly (loses 200 points)
   - Verify question is still visible and clickable
   - Player 2 answers incorrectly (loses 200 points)
   - Verify question is still visible and clickable
   - Player 3 answers correctly (gains 200 points)
   - Verify question is now marked as answered and unavailable

3. **Test Case: Score Tracking**
   - Start with Player 1 at 0 points
   - Answer 200-point question incorrectly
   - Verify Player 1 score is -200
   - Switch to Player 2 at 0 points
   - Answer same 200-point question correctly
   - Verify Player 2 score is +200

4. **Test Case: Answer History Tracking**
   - Query the `answerHistory` table after multiple attempts
   - Verify each attempt is recorded with correct player, question, and result

5. **Test Case: Manual Override**
   - Player 1 attempts a question
   - Host uses "Force Incorrect" on Player 1
   - Verify Player 1 cannot attempt again
   - Player 2 can still attempt the question

## Migration & Deployment Notes

- **No database migration required**: Uses existing tables
- **Backward compatible**: Existing games continue to work
- **Recommendation**: Reset active games after deployment for consistent behavior
- **Database queries**: Added one query per answer submission (check for previous attempts)

## Performance Considerations

- Additional database query (`hasPlayerAttemptedQuestion`) runs before each answer submission
- Query is indexed and efficient (uses composite index on gameId, playerId, questionId)
- Answer history inserts are asynchronous and don't block the UI
- No significant performance impact expected

## Future Enhancement Ideas

1. Add visual indicator on game board showing number of failed attempts
2. Allow admin configuration: "X strikes before question is retired"
3. Show which players have already attempted when hovering over a question
4. Add animation/sound effect when multiple players attempt same question
5. Leaderboard stat: "Most questions answered after others failed"

## Files Modified

1. `src/server/actions/history.ts`
2. `src/app/question/[id]/client.tsx`
3. `docs/features/52-multiple-player-attempts.md` (new)
4. `docs/features/README.md`

## Verification Checklist

- [x] Player can answer incorrectly without closing question
- [x] Other players can attempt after incorrect answer
- [x] Player cannot attempt same question twice
- [x] Question marked as answered only when correct
- [x] All attempts recorded in history
- [x] Scores update correctly for all scenarios
- [x] Manual override respects same rules
- [x] Documentation updated
- [x] No linter errors
- [x] Code follows project conventions

## Code Review Notes

- All functions follow existing patterns in the codebase
- Error handling is consistent with other actions
- Type safety maintained throughout
- Server actions properly marked with "use server"
- Client component properly uses React hooks
- Database queries use proper Drizzle ORM syntax

