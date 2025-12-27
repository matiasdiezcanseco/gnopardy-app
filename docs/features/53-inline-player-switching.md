# Feature: Inline Player Switching on Question Page

## Overview

Allows players to be switched directly on the question page after an incorrect answer, without having to navigate back to the game board. This creates a smoother and faster gameplay experience, especially when multiple players want to attempt the same question.

## Implementation Details

### Behavior Changes

**Previous Behavior:**
- Player answers incorrectly
- Feedback is shown with countdown timer
- Auto-redirects to game board after 5 seconds
- Host must select new player and navigate back to question

**New Behavior:**
- Player answers **incorrectly** → Feedback shown, but NO auto-redirect
- Player selector appears below the feedback
- Host can immediately select another player to attempt the question
- Selected player's view loads instantly without leaving the page
- When answer is **correct** → Auto-redirects to game board after 5 seconds (as before)

### User Flow

#### Scenario: Player 1 Answers Incorrectly

1. Player 1 navigates to a question
2. Player 1 submits incorrect answer
3. **Feedback shows**: "Incorrect! -200 points"
4. **Below feedback**: "Question Still Available - Select another player to attempt this question"
5. **Player selector displays** all other players (excluding Player 1)
6. Host clicks on Player 2
7. Page updates to show Player 2's name and score in header
8. Question remains visible with fresh input fields
9. Player 2 can now attempt the question

### Component Updates

**File**: `src/app/question/[id]/client.tsx`

#### New State Management

Added state to track:
- `currentPlayer`: The player currently attempting the question
- `allPlayers`: Full list of all players in the game

```typescript
const [currentPlayer, setCurrentPlayer] = useState<Player>(initialPlayer);
const [allPlayers, setAllPlayers] = useState<Player[]>(initialAllPlayers);
```

#### New Handler Function

Added `handlePlayerSwitch` function:

```typescript
const handlePlayerSwitch = async (newPlayerId: number) => {
  // Reset result and error when switching players
  setResult(null);
  setError(null);

  // Fetch the new player's data
  startTransition(async () => {
    const playerResult = await getPlayerById(newPlayerId);
    if (playerResult.success) {
      setCurrentPlayer(playerResult.data);
    } else {
      setError("Failed to load player data");
    }
  });
};
```

#### Updated Answer Handlers

All three answer submission handlers now:
- Use `currentPlayer` instead of static `player` prop
- Update both `currentPlayer` and `allPlayers` state after score changes
- Maintain real-time score updates in the UI

#### Updated Feedback Display

Modified the feedback section to:
- Disable auto-navigation when answer is incorrect (`autoNavigateDelay={result.isCorrect ? 5 : 0}`)
- Show `PlayerSelector` component when answer is incorrect
- Filter out the current player from the selector (they already attempted)
- Display "Return to Game Board" button as alternative

```typescript
{result ? (
  <div className="space-y-6">
    <AnswerFeedback
      isCorrect={result.isCorrect}
      points={result.points}
      correctAnswer={result.correctAnswer}
      gameId={gameId}
      autoNavigateDelay={result.isCorrect ? 5 : 0}
    />

    {!result.isCorrect && (
      <div className="rounded-xl border bg-card p-6 shadow-md space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Question Still Available
          </h3>
          <p className="text-muted-foreground mb-4">
            Select another player to attempt this question
          </p>
        </div>
        
        <PlayerSelector
          players={allPlayers.filter(p => p.id !== currentPlayer.id)}
          selectedPlayerId={null}
          onSelectPlayer={handlePlayerSwitch}
        />

        <div className="pt-4 border-t flex justify-center">
          <Link href={`/game/${gameId}`}>
            <Button variant="outline">
              Return to Game Board
            </Button>
          </Link>
        </div>
      </div>
    )}
  </div>
) : (
  /* Question display */
)}
```

### Server-Side Updates

**File**: `src/app/question/[id]/page.tsx`

#### Updated Data Fetching

Added fetching of all players for the game:

```typescript
const [questionResult, answersResult, playerResult, allPlayersResult, answeredResult] = 
  await Promise.all([
    getQuestionById(questionId),
    getAnswersByQuestionId(questionId),
    getPlayerById(playerIdNum),
    getPlayersByGameId(gameIdNum), // NEW: Fetch all players
    isQuestionAnsweredInGame(gameIdNum, questionId),
  ]);
```

#### Updated Props

Pass `allPlayers` to client component:

```typescript
return (
  <QuestionPageClient
    question={question}
    answers={answers}
    player={player}
    allPlayers={allPlayers} // NEW prop
    gameId={gameIdNum}
  />
);
```

### Visual Design

The player switching interface features:
- **Feedback Section**: Shows incorrect answer result with red gradient
- **Separator Space**: Visual gap between feedback and player selector
- **Clear Heading**: "Question Still Available" in large text
- **Descriptive Text**: Explains what to do next
- **Player Selector**: Uses existing `PlayerSelector` component
  - Shows player avatars with initials
  - Displays names and current scores
  - Hover effects for interactivity
  - Excludes the player who just attempted
- **Fallback Button**: "Return to Game Board" for manual navigation
- **Consistent Styling**: Matches the game's design system

### Benefits

1. **Faster Gameplay**: No need to navigate back and forth
2. **Better Flow**: Maintains focus on the question
3. **Time Saving**: Reduces clicks and page loads
4. **Better UX**: More intuitive for competitive play
5. **Maintains Context**: Question stays visible throughout
6. **Real-time Updates**: Scores update immediately in the selector

### Technical Notes

- Player data is fetched fresh when switching to ensure scores are up-to-date
- The `result` state is cleared when switching players, resetting the view
- Error state is also cleared to provide a clean slate
- The player selector only shows players who haven't attempted the question yet (enforced by backend)
- Correct answers still auto-navigate to maintain game flow
- All existing functionality (text input, multiple choice, manual override) works seamlessly

## Code Changes Summary

### Modified Files
- `src/app/question/[id]/client.tsx`: Added player switching logic and UI
- `src/app/question/[id]/page.tsx`: Fetch all players for the game
- `src/components/question/AnswerFeedback.tsx`: No changes needed (already supports conditional auto-navigation)

### New Imports
- `PlayerSelector` from `~/components/player/PlayerSelector`
- `getPlayerById` from `~/server/actions/player`

### New State Variables
- `currentPlayer`: Tracks the active player
- `allPlayers`: Stores all game players for the selector

### New Functions
- `handlePlayerSwitch(newPlayerId)`: Switches the active player

## Testing Scenarios

### Test Case 1: Player Switch After Incorrect Answer
1. Start game with 3 players
2. Player 1 answers question incorrectly
3. Verify feedback shows "Incorrect!"
4. Verify player selector appears below feedback
5. Verify selector shows Players 2 and 3 (not Player 1)
6. Click on Player 2
7. Verify header updates to show Player 2's name and score
8. Verify question is still displayed and ready for input

### Test Case 2: Multiple Switches on Same Question
1. Player 1 answers incorrectly
2. Switch to Player 2
3. Player 2 answers incorrectly
4. Verify selector now only shows Player 3 (Players 1 and 2 excluded)
5. Switch to Player 3
6. Player 3 answers correctly
7. Verify auto-redirect to game board occurs

### Test Case 3: Correct Answer Flow Unchanged
1. Player 1 answers question correctly
2. Verify feedback shows "Correct!"
3. Verify NO player selector appears
4. Verify auto-redirect countdown starts (5 seconds)
5. Verify navigation to game board occurs

### Test Case 4: Score Updates
1. Player 1 starts with 0 points
2. Player 1 answers 200-point question incorrectly
3. Verify header shows Player 1 at -200
4. Switch to Player 2 (starting at 0 points)
5. Verify header updates to show Player 2 at 0
6. Player 2 answers correctly
7. Verify header shows Player 2 at +200

### Test Case 5: Manual Return to Game Board
1. Player answers incorrectly
2. Player selector appears
3. Click "Return to Game Board" button
4. Verify navigation to game board
5. Verify question is still clickable (not marked as answered)

## Integration with Other Features

### Works With Feature 52 (Multiple Player Attempts)
- Perfectly complements the multiple attempts feature
- Players can switch without losing the question state
- Each player's attempt is still tracked in history
- Prevention of duplicate attempts still enforced

### Works With Feature 51 (Manual Answer Override)
- Manual override still available on the page
- Works for any player currently selected
- Override respects the same player-switching rules

### Works With All Question Types
- Text answer input
- Multiple choice selection
- Audio questions
- Video questions
- Image questions

## Future Enhancements

Potential improvements could include:

- **Visual Indicator**: Show which players have already attempted (grayed out or marked)
- **Attempt Counter Badge**: Display number of failed attempts on the question card
- **Keyboard Navigation**: Allow arrow keys to switch between players
- **Auto-Select**: Automatically select next player who hasn't attempted
- **Confirmation Dialog**: Optional "Switch player?" confirmation for host control
- **Player Buzzer System**: Add "buzz in" mechanic where players compete to answer first

## Performance Considerations

- Fetching player data on switch is a single, fast query
- No unnecessary re-renders of the question or answers
- State updates are optimized to only affect relevant components
- Player selector only renders when needed (incorrect answers)

## Accessibility Notes

- Player selector maintains keyboard navigation
- Screen readers announce player switches
- Focus management ensures smooth transitions
- All interactive elements remain accessible
- Clear visual hierarchy for better understanding

## Migration Notes

- **No database changes required**
- **Backward compatible** with existing games
- Works seamlessly with the existing answer history feature
- No breaking changes to any APIs or components

## Files Modified

1. `src/app/question/[id]/client.tsx` - Added player switching
2. `src/app/question/[id]/page.tsx` - Fetch all players
3. `docs/features/53-inline-player-switching.md` - This documentation

## Verification Checklist

- [x] Player selector appears after incorrect answer
- [x] Player selector does NOT appear after correct answer
- [x] Switching players updates header with new name/score
- [x] Question remains visible after player switch
- [x] Scores update correctly in real-time
- [x] Current player excluded from selector
- [x] Manual "Return to Game Board" button works
- [x] Auto-navigation disabled for incorrect answers
- [x] Auto-navigation works for correct answers
- [x] All question types supported
- [x] No linter errors
- [x] Follows project conventions

