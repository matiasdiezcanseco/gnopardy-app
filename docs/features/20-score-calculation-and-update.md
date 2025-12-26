# Feature 20: Score Calculation and Update

**Status**: Completed  
**Priority**: Critical  
**Category**: Backend/Game Logic

## Description

Implement score calculation logic that adds points for correct answers and subtracts points for incorrect answers, then updates the player's score in the database.

## Requirements

- Calculate points based on question point value
- Add points for correct answers
- Subtract points for incorrect answers
- Update player score atomically in database
- Return updated score
- Handle score going negative (if allowed)

## Acceptance Criteria

- [ ] `updatePlayerScore` action calculates points correctly
- [ ] Correct answers add question point value to score
- [ ] Incorrect answers subtract question point value from score
- [ ] Score update is atomic (database transaction)
- [ ] Returns updated score value
- [ ] Handles concurrent score updates safely
- [ ] Logs score changes for audit trail (optional)

## Technical Notes

- Use database transactions for atomic updates
- Place in `src/server/actions/score.ts`
- Consider optimistic locking for concurrent updates
- Follow database patterns from `docs/DATABASE.md`

