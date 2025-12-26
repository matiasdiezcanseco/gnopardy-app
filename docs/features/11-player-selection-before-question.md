# Feature 11: Player Selection Before Question

**Status**: Completed  
**Priority**: Critical  
**Category**: Frontend/Game Logic

## Description

Implement player selection functionality that requires selecting a player before clicking on a question. Store selected player in state/context.

## Requirements

- Display list of players in current game
- Allow selection of active player
- Store selected player ID in application state
- Show selected player indicator
- Require player selection before question can be clicked
- Persist selection across navigation

## Acceptance Criteria

- [ ] Player list component displays all players in game
- [ ] Players can be selected (single selection)
- [ ] Selected player is visually highlighted
- [ ] Selected player ID stored in state/context
- [ ] Question cells disabled until player is selected
- [ ] Selected player persists when navigating to question page
- [ ] Player selection persists when returning to game board

## Technical Notes

- Use React Context or Zustand for state management
- Create `src/components/player/PlayerSelector.tsx`
- Store selected player ID in context/state
- Validate player selection before question navigation

