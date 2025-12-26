# Feature 19: Answer Validation Logic

**Status**: Pending  
**Priority**: Critical  
**Category**: Backend/Game Logic

## Description

Implement server-side logic to validate submitted answers against correct answers stored in the database, with support for case-insensitive matching and flexible text matching.

## Requirements

- Compare submitted answer with correct answer(s) from database
- Support case-insensitive matching for text answers
- Handle multiple choice answer validation
- Return validation result (correct/incorrect)
- Return correct answer for display if wrong
- Support partial credit (optional, future feature)

## Acceptance Criteria

- [ ] `validateAnswer` server action compares answers
- [ ] Text answers matched case-insensitively
- [ ] Multiple choice answers matched by answer ID
- [ ] Returns `{ isCorrect: boolean, correctAnswer?: string }`
- [ ] Handles questions with single correct answer
- [ ] Handles questions with multiple correct answers (if needed)
- [ ] Trims whitespace from text answers
- [ ] Handles special characters appropriately

## Technical Notes

- Create `src/server/actions/answer.ts` validation function
- Use database query to fetch correct answer
- Implement flexible matching algorithm
- Consider fuzzy matching for future enhancements

