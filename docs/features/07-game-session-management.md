# Feature 07: Game Session Management

**Status**: Completed  
**Priority**: High  
**Category**: Backend/Database

## Description

Implement game session management including creating games, tracking game state (active/completed), and managing game lifecycle.

## Requirements

- Create server actions for game operations
- Track game status (active, completed)
- Link players to games
- Record game completion timestamp
- Support multiple concurrent games

## Acceptance Criteria

- [ ] `createGame` action creates new game session
- [ ] `getGameById` action retrieves game with players and state
- [ ] `getActiveGames` action retrieves all active games
- [ ] `updateGameStatus` action updates game status
- [ ] `completeGame` action marks game as completed with timestamp
- [ ] `deleteGame` action removes game (with cascade considerations)

## Technical Notes

- Place actions in `src/server/actions/game.ts`
- Include game state validation
- Consider soft deletes for game history

