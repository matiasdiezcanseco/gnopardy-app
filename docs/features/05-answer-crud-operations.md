# Feature 05: Answer CRUD Operations

**Status**: Pending  
**Priority**: High  
**Category**: Backend/Database

## Description

Implement CRUD operations for answers, supporting both single correct answers and multiple choice options with ordering.

## Requirements

- Create server actions for answer operations
- Support multiple answers per question (for multiple choice)
- Maintain order field for answer options
- Mark correct answer(s) with isCorrect flag
- Link answers to questions

## Acceptance Criteria

- [ ] `createAnswer` action creates new answer linked to question
- [ ] `getAnswersByQuestionId` action retrieves all answers for a question
- [ ] `getCorrectAnswer` action retrieves correct answer(s) for a question
- [ ] `updateAnswer` action updates existing answer
- [ ] `deleteAnswer` action removes answer
- [ ] Answers can be ordered using order field
- [ ] Support for multiple correct answers (if needed)

## Technical Notes

- Place actions in `src/server/actions/answer.ts`
- Order answers by `order` field when retrieving
- Validate that at least one correct answer exists per question

