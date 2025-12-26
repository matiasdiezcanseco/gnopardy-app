# Feature 06: Player CRUD Operations

**Status**: Pending  
**Priority**: High  
**Category**: Backend/Database

## Description

Implement CRUD operations for players, including score management and linking players to games.

## Requirements

- Create server actions for player operations
- Support score updates (add/subtract points)
- Link players to game sessions
- Track player creation timestamps

## Acceptance Criteria

- [ ] `createPlayer` action creates new player
- [ ] `getPlayers` action retrieves all players (optionally filtered by gameId)
- [ ] `getPlayerById` action retrieves single player
- [ ] `updatePlayer` action updates player information
- [ ] `updatePlayerScore` action adds/subtracts points from player score
- [ ] `deletePlayer` action removes player
- [ ] Players can be associated with games

## Technical Notes

- Place actions in `src/server/actions/player.ts`
- Score updates should be atomic operations
- Consider using database transactions for score updates

