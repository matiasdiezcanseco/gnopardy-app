# Feature 23: Score Board Component

**Status**: Pending  
**Priority**: High  
**Category**: Frontend/Components

## Description

Create a ScoreBoard component that displays all players' scores in real-time, updating as answers are submitted.

## Requirements

- Display list of players with their current scores
- Show scores prominently
- Highlight current/active player
- Update scores in real-time
- Sort players by score (optional)
- Show score changes with animations

## Acceptance Criteria

- [ ] ScoreBoard displays all players in game
- [ ] Current score shown for each player
- [ ] Active player highlighted visually
- [ ] Scores update when answers are submitted
- [ ] Score changes animate (count up/down)
- [ ] Component is responsive
- [ ] Players sorted by score (highest first, optional)
- [ ] Component updates without full page refresh

## Technical Notes

- Create `src/components/game/ScoreBoard.tsx`
- Use React state or context for real-time updates
- Consider using server-sent events or polling for updates
- Follow component patterns from `docs/COMPONENTS.md`

