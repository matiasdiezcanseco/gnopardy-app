# Feature: Manual Answer Override

## Overview

Allows the game host to manually force a question to be marked as correct or incorrect, regardless of the submitted answer. This is useful when a player provides an answer that is close to the correct answer but not an exact match, and the host wants to exercise discretion in awarding or denying points.

## Implementation Details

### Server Action

**File**: `src/server/actions/answer.ts`

Added a new server action `manualAnswerOverride` that:

- Accepts a `questionId` and a `forceCorrect` boolean parameter
- Retrieves the question to get the point value
- Retrieves the correct answer for display purposes
- Returns a validation result that can be used to update player scores

```typescript
export async function manualAnswerOverride(
  questionId: number,
  forceCorrect: boolean,
): Promise<ActionResult<ValidationResult>>;
```

### Client Component Updates

**File**: `src/app/question/[id]/client.tsx`

#### New Handler Function

Added `handleManualOverride` function that:

- Calls the `manualAnswerOverride` server action
- Updates the player's score (adds or subtracts points based on override)
- Marks the question as answered in the current game
- Displays the result feedback

#### UI Components

Added a "Host Controls" section below the answer input area with:

- **Force Correct Button** (Green):
  - Awards the full point value to the player
  - Marks the question as correct
  - Shows success feedback
- **Force Incorrect Button** (Red):
  - Deducts the point value from the player
  - Marks the question as incorrect
  - Shows the correct answer in the feedback

### Visual Design

The manual override section features:

- Dashed border to distinguish it from the main answer section
- Clear labeling as "Host Controls"
- Descriptive text explaining the purpose
- Two prominent buttons with distinct colors:
  - Green (✓) for "Force Correct"
  - Red (✗) for "Force Incorrect"
- Both buttons are disabled while processing to prevent double-submission
- Icons for visual clarity

### User Flow

1. Player navigates to a question page
2. Player sees the question and answer input options
3. Below the answer input, the host sees "Host Controls" section
4. If the player gives a verbal answer or an answer close to correct:
   - Host can click "Force Correct" to award points
   - Host can click "Force Incorrect" to deny points
5. The system processes the override same as a regular answer:
   - Updates player score
   - Marks question as answered
   - Shows appropriate feedback
   - Redirects back to game board

### Benefits

- **Flexibility**: Allows human judgment for ambiguous answers
- **Fair Play**: Host can award points for creative or alternative correct answers
- **Streamlined**: No need to edit scores manually after the fact
- **Clear Intent**: Separate from regular answer submission, clearly marked as host controls
- **Consistent Behavior**: Uses the same score update and game state logic as normal answers

## Usage Example

### Scenario

- Question: "What is the capital of France?"
- Correct Answer: "Paris"
- Player's Verbal Answer: "Paris, France"

Since the player's verbal answer includes extra information but is essentially correct, the host can click **"Force Correct"** to award the points without requiring the exact text match.

### Another Scenario

- Question: "Name this composer" (with audio clip)
- Correct Answer: "Wolfgang Amadeus Mozart"
- Player's Answer: "Mozart"

The host can decide whether "Mozart" alone is sufficient and click **"Force Correct"** to award points, even though the full name wasn't provided.

## Technical Notes

- The manual override functionality is always available on the question page
- It works for all question types (text, multiple choice, audio, video, image)
- The override buttons are only shown before an answer is submitted
- Once an answer is processed (either via normal submission or manual override), the feedback screen is shown
- The override respects the question's point value
- All database operations (score update, question marking) are identical to normal answer validation

## Future Enhancements

Potential improvements could include:

- Adding partial points option (e.g., award half points)
- Adding a "requires review" state before forcing decision
- Logging override decisions for game history
- Optional confirmation dialog before applying override
- Host authentication to prevent players from using override buttons
