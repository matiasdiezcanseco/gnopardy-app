# Feature 33: Game Completion Detection

**Status**: Pending  
**Priority**: Medium  
**Category**: Backend/Game Logic

## Description

Implement logic to detect when all questions have been answered and mark the game as completed.

## Requirements

- Check if all questions are answered
- Update game status to "completed"
- Set completion timestamp
- Trigger completion event/handler
- Display completion message
- Show final scores

## Acceptance Criteria

- [ ] Game completion detected when all questions answered
- [ ] Game status updated to "completed"
- [ ] Completion timestamp recorded
- [ ] Completion handler triggered
- [ ] Final scores displayed
- [ ] Winner(s) identified and highlighted
- [ ] Option to start new game shown

## Technical Notes

- Create `checkGameCompletion` function
- Query database for unanswered questions count
- Update game status atomically
- Consider using database triggers or application logic

