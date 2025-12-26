# Feature 08: Game Board Display

**Status**: Pending  
**Priority**: Critical  
**Category**: Frontend/Components

## Description

Create the main game board component that displays categories as columns and questions as cells with point values in a grid layout.

## Requirements

- Display categories as column headers
- Display questions as clickable cells with point values
- Show visual state for answered vs unanswered questions
- Responsive grid layout
- Support for 5-6 categories with 5 questions each

## Acceptance Criteria

- [ ] GameBoard component displays category columns
- [ ] Question cells show point values ($100, $200, etc.)
- [ ] Answered questions are visually distinct (disabled/grayed out)
- [ ] Unanswered questions are clickable and highlighted
- [ ] Grid is responsive (mobile, tablet, desktop)
- [ ] Categories are fetched from database
- [ ] Questions are organized by category and point value

## Technical Notes

- Create `src/components/game/GameBoard.tsx`
- Use Tailwind CSS grid system
- Follow responsive patterns from `docs/STYLING.md`
- Use shadcn/ui components where appropriate

