# Feature 10: Question Cell Component

**Status**: Pending  
**Priority**: High  
**Category**: Frontend/Components

## Description

Create a clickable QuestionCell component that displays point values and handles question selection.

## Requirements

- Display point value prominently ($100, $200, etc.)
- Handle click events
- Show disabled state when question is answered
- Visual feedback on hover
- Accessible button/clickable element

## Acceptance Criteria

- [ ] QuestionCell displays point value
- [ ] Component is clickable when question is unanswered
- [ ] Disabled state shown when question is answered
- [ ] Hover effects provide visual feedback
- [ ] Component is keyboard accessible
- [ ] Click handler triggers navigation to question page

## Technical Notes

- Create `src/components/game/QuestionCell.tsx`
- Use shadcn/ui Button component
- Follow styling from `docs/STYLING.md`
- Use `cn()` utility for conditional classes

