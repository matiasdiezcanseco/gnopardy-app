# Feature 04: Question CRUD Operations

**Status**: Pending  
**Priority**: High  
**Category**: Backend/Database

## Description

Implement Create, Read, Update, Delete operations for questions, including support for different question types (text, multiple choice, audio, video, image).

## Requirements

- Create server actions for question operations
- Support question types: text, multiple_choice, audio, video, image
- Handle mediaUrl field for multimedia questions
- Link questions to categories
- Validate point values (typically 100, 200, 300, 400, 500)

## Acceptance Criteria

- [ ] `createQuestion` action creates new question with type and mediaUrl
- [ ] `getQuestions` action retrieves all questions (with optional category filter)
- [ ] `getQuestionById` action retrieves single question with category info
- [ ] `getQuestionsByCategory` action retrieves questions for specific category
- [ ] `updateQuestion` action updates existing question
- [ ] `deleteQuestion` action removes question
- [ ] Point values validated (100-500 range)
- [ ] Question type validation

## Technical Notes

- Place actions in `src/server/actions/question.ts`
- Include joins with categories table
- Support filtering and sorting

