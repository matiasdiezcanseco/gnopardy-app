# Feature 32: Navigation Between Pages

**Status**: Pending  
**Priority**: High  
**Category**: Frontend/Routing

## Description

Implement smooth navigation between game board and question pages, maintaining game state and selected player.

## Requirements

- Navigate from game board to question page on question click
- Navigate back from question page to game board
- Maintain selected player across navigation
- Preserve game state during navigation
- Use Next.js navigation (useRouter)
- Handle browser back button

## Acceptance Criteria

- [ ] Clicking question navigates to question page
- [ ] Back button returns to game board
- [ ] Selected player persists across navigation
- [ ] Game state maintained during navigation
- [ ] Browser back button works correctly
- [ ] URL reflects current page state
- [ ] Navigation is smooth (no full page reload)
- [ ] Loading states during navigation

## Technical Notes

- Use Next.js App Router navigation
- Use React Context or Zustand for state persistence
- Follow routing patterns from `docs/FOLDER_STRUCTURE.md`
- Consider using shallow routing for state

