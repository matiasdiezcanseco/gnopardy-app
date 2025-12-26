# Feature 26: Game Board Page Route

**Status**: Pending  
**Priority**: Critical  
**Category**: Frontend/Routing

## Description

Create the main game board page route that displays the game board, score board, and player selection components.

## Requirements

- Create Next.js route at `src/app/game/[id]/page.tsx`
- Fetch game data including categories and questions
- Display GameBoard component
- Display ScoreBoard component
- Display PlayerSelector component
- Handle loading and error states
- Support game ID parameter

## Acceptance Criteria

- [ ] Route `/game/[id]` exists and is accessible
- [ ] Game data fetched from database using game ID
- [ ] Categories and questions loaded for game
- [ ] GameBoard component displayed
- [ ] ScoreBoard component displayed
- [ ] PlayerSelector component displayed
- [ ] Loading state shown while fetching
- [ ] Error handling for invalid game IDs
- [ ] Page is responsive

## Technical Notes

- Use Next.js Server Components for data fetching
- Follow routing patterns from `docs/FOLDER_STRUCTURE.md`
- Use Server Actions or API routes
- Consider layout component for shared game UI

