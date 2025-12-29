# Feature 54: Manual Score Adjustment

## Overview

This feature allows the game host to manually adjust player scores during the game. This is useful for correcting mistakes, awarding bonus points, or applying penalties outside of the normal question answering flow.

## User Story

**As a game host**, I want to manually add or subtract points from players' scores so that I can make corrections or adjustments during the game as needed.

## Requirements

### Functional Requirements

1. **Player Selection**
   - Display all players in the current game
   - Show player name and current score
   - Allow selecting one player at a time for adjustment
   - Highlight the selected player

2. **Points Input**
   - Provide an input field for entering point amounts
   - Accept only positive integer values
   - Support quick selection buttons for common point values (100, 200, 300, 400, 500, 1000)

3. **Add/Subtract Actions**
   - Provide separate buttons for adding and subtracting points
   - Add Points: Adds the entered amount to the player's score
   - Subtract Points: Subtracts the entered amount from the player's score
   - Disable actions when no player is selected or no points are entered

4. **Feedback**
   - Display success message after adjustment
   - Show error message if adjustment fails
   - Update scoreboard in real-time
   - Clear input after successful adjustment

### UI/UX Requirements

1. **Placement**: Position on the main game board page between player selection and game board
2. **Visual Design**: Card-style component matching existing game UI
3. **Responsive**: Works on desktop and mobile devices
4. **Accessibility**: Proper labels and keyboard navigation
5. **Color Coding**: 
   - Green button for adding points
   - Red button for subtracting points
   - Visual feedback for selected player

## Implementation

### Components

#### `ManualScoreAdjustment.tsx`

**Location**: `src/components/player/ManualScoreAdjustment.tsx`

**Description**: Main component for manual score adjustment functionality.

**Props**:
```typescript
interface ManualScoreAdjustmentProps {
  players: Player[];              // Array of players in the game
  onScoreUpdated: (updatedPlayer: Player) => void;  // Callback when score is updated
  className?: string;             // Optional CSS classes
}
```

**Features**:
- Player selection with visual feedback
- Points input field with validation
- Add/Subtract buttons with color coding
- Quick point selection buttons
- Success/error message display
- Real-time score updates

**State Management**:
```typescript
const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
const [pointsAmount, setPointsAmount] = useState<string>("");
const [isLoading, setIsLoading] = useState(false);
const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
```

### Server Actions

Uses existing `updatePlayerScore` action:

**File**: `src/server/actions/player.ts`

**Function**: `updatePlayerScore(id: number, pointsDelta: number)`

**Description**: Atomically updates a player's score by adding/subtracting points.

```typescript
export async function updatePlayerScore(
  id: number,
  pointsDelta: number
): Promise<ActionResult<Player>>
```

- **Parameters**:
  - `id`: Player ID
  - `pointsDelta`: Points to add (positive) or subtract (negative)
- **Returns**: Updated player object or error
- **Database**: Uses SQL increment for atomic updates

### Integration

#### Game Page Client (`src/app/game/[id]/client.tsx`)

1. **Import Component**:
```typescript
import { ManualScoreAdjustment } from "~/components/player/ManualScoreAdjustment";
```

2. **Add Score Update Handler**:
```typescript
const handleScoreUpdated = useCallback((updatedPlayer: Player) => {
  setPlayers((prev) =>
    prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
  );
}, []);
```

3. **Render Component**:
```tsx
<ManualScoreAdjustment
  players={players}
  onScoreUpdated={handleScoreUpdated}
/>
```

## User Flow

### Basic Flow

1. **Select Player**
   - Host clicks on a player from the list
   - Selected player is highlighted
   - Current score is displayed

2. **Enter Points**
   - Host types point amount in input field
   - Or clicks a quick selection button (100-1000)

3. **Choose Action**
   - Host clicks "Add Points" or "Subtract Points"
   - System validates input
   - Score is updated in database

4. **See Result**
   - Success message displays briefly
   - Scoreboard updates immediately
   - Input field is cleared
   - Can make another adjustment

### Quick Adjustment Flow

1. Host selects player
2. Host clicks quick selection button (e.g., 200)
3. Host clicks Add or Subtract
4. Score updates immediately

### Error Handling

1. **No Player Selected**: Error message "Please select a player and enter points"
2. **Invalid Points**: Error message "Please enter a valid positive number"
3. **Database Error**: Error message "Failed to update score"

## Validation

### Client-Side Validation

1. **Player Selection**: Must select a player before adjusting
2. **Points Amount**: 
   - Must be a positive integer
   - Cannot be empty
   - Must be parseable as a number

### Server-Side Validation

1. **Player Exists**: Verifies player ID exists in database
2. **Atomic Update**: Uses SQL increment for race condition safety

## UI Components

### Layout Structure

```
┌─────────────────────────────────────────┐
│  Manual Score Adjustment                │
├─────────────────────────────────────────┤
│  Select Player                          │
│  ┌──────────┐  ┌──────────┐            │
│  │ Player 1 │  │ Player 2 │            │
│  │   $500   │  │   $300   │            │
│  └──────────┘  └──────────┘            │
├─────────────────────────────────────────┤
│  Points Amount                          │
│  ┌─────────────────────────────────┐   │
│  │ Enter points (e.g., 100)        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌───────────────┐  ┌───────────────┐  │
│  │ + Add Points  │  │ - Subtract    │  │
│  │    (Green)    │  │   Points (Red)│  │
│  └───────────────┘  └───────────────┘  │
├─────────────────────────────────────────┤
│  Quick Adjust                           │
│  [100] [200] [300] [400] [500] [1000]  │
└─────────────────────────────────────────┘
```

### Styling

- **Component**: Card with rounded borders and shadow
- **Player Selection**: Grid layout, 1-2 columns depending on screen size
- **Buttons**: Full-width Add/Subtract buttons with distinct colors
- **Quick Buttons**: Small outline buttons in grid layout
- **Messages**: Colored banners (green for success, red for error)

## Accessibility

1. **Keyboard Navigation**:
   - All buttons are keyboard accessible
   - Tab order: Player selection → Points input → Add/Subtract buttons → Quick buttons

2. **Screen Readers**:
   - Labels for all inputs
   - ARIA labels for buttons
   - Status messages announced

3. **Visual**:
   - High contrast colors
   - Clear button labels
   - Visual feedback for selection

## Testing Scenarios

### Manual Testing

1. **Add Points**:
   - Select a player
   - Enter 100 points
   - Click "Add Points"
   - Verify score increases by 100

2. **Subtract Points**:
   - Select a player with score > 0
   - Enter 200 points
   - Click "Subtract Points"
   - Verify score decreases by 200

3. **Quick Selection**:
   - Select a player
   - Click "500" quick button
   - Click "Add Points"
   - Verify score increases by 500

4. **Validation**:
   - Try adjusting without selecting player → See error
   - Try adjusting with empty points → See error
   - Enter negative number → See error

5. **Multiple Adjustments**:
   - Make multiple adjustments to same player
   - Switch between players
   - Verify all updates work correctly

6. **Real-time Updates**:
   - Make adjustment
   - Check scoreboard updates immediately
   - Check player ranking updates if needed

## Use Cases

1. **Correction**: Player's answer was marked wrong but was actually correct
2. **Bonus Points**: Award bonus points for exceptional performance
3. **Penalty**: Deduct points for rule violations
4. **Technical Issues**: Adjust scores if system error occurred
5. **Special Rules**: Apply custom game rules (e.g., "steal" points)

## Future Enhancements

1. **Adjustment History**: Log all manual adjustments with timestamp and reason
2. **Reason Field**: Optional text field to document why adjustment was made
3. **Undo**: Ability to undo the last manual adjustment
4. **Bulk Adjustment**: Apply same adjustment to multiple players at once
5. **Preset Adjustments**: Save common adjustment amounts
6. **Admin Only**: Restrict manual adjustments to admin/host role

## Related Features

- **Feature 06**: Player CRUD Operations (uses updatePlayerScore action)
- **Feature 20**: Score Calculation and Update (related score logic)
- **Feature 23**: Score Board Component (displays updated scores)
- **Feature 51**: Manual Answer Override (similar host intervention feature)

## Benefits

1. **Flexibility**: Allows host to handle edge cases and special situations
2. **Error Correction**: Quick way to fix mistakes without restarting game
3. **Custom Rules**: Enables custom game rules and variations
4. **Transparency**: Visual feedback keeps all players informed
5. **Simplicity**: Easy-to-use interface for non-technical users

---

**Status**: ✅ Implemented  
**Last Updated**: December 26, 2025

