# Feature 34: Reset Game Functionality

**Status**: Pending  
**Priority**: Low  
**Category**: Backend/Game Logic

## Description

Implement functionality to reset a game, clearing all answered questions and resetting player scores.

## Requirements

- Reset all questions to unanswered state
- Reset all player scores to zero
- Reset game status to active
- Clear completion timestamp
- Provide confirmation dialog
- Update UI immediately

## Acceptance Criteria

- [ ] Reset button available (admin/host only)
- [ ] Confirmation dialog before reset
- [ ] All questions marked as unanswered
- [ ] All player scores reset to 0
- [ ] Game status reset to active
- [ ] UI updates immediately
- [ ] Reset is atomic (transaction)

## Technical Notes

- Create `resetGame` server action
- Use database transaction for atomic reset
- Require admin/host permissions
- Follow confirmation patterns

