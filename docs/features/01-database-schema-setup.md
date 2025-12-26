# Feature 01: Database Schema Setup

**Status**: Pending  
**Priority**: Critical  
**Category**: Backend/Database

## Description

Set up the complete database schema using Drizzle ORM for all game entities including categories, questions, answers, players, and games.

## Requirements

- Create tables for categories, questions, answers, players, and games
- Define relationships between tables (foreign keys)
- Set up proper indexes for performance
- Use table prefix `jeopardy-app_` for multi-project schema support
- Include timestamps (createdAt, updatedAt) where appropriate

## Acceptance Criteria

- [ ] Categories table created with id, name, description, color fields
- [ ] Questions table created with id, categoryId, text, points, type, mediaUrl, isAnswered fields
- [ ] Answers table created with id, questionId, text, isCorrect, order fields
- [ ] Players table created with id, name, score, gameId fields
- [ ] Games table created with id, name, status, createdAt, completedAt fields
- [ ] All foreign key relationships properly defined
- [ ] Schema can be pushed to database successfully

## Technical Notes

- Follow patterns in `docs/DATABASE.md`
- Use Drizzle ORM table creator function
- Ensure type safety with TypeScript inference

