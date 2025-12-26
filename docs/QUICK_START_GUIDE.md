# Quick Start Guide - Enhancement Features

## Getting Started with New Features

### 1. Database Setup

First, apply the new database schema changes:

```bash
pnpm db:push
```

This creates the new tables for game history, player statistics, and answer tracking.

---

## Feature Usage Guide

### 🎨 Theme Customization

**Access:** Click the theme button in the top navigation bar

**Available Themes:**
- 🌙 Dark - Default dark theme
- ☀️ Light - Light mode
- 🎮 Classic Jeopardy - Traditional blue & gold
- 🌊 Ocean - Teal/cyan theme
- 🌅 Sunset - Orange/purple theme

**Note:** Your theme preference is saved and persists across sessions.

---

### 📊 Leaderboard

**Access:** Navigate to `/leaderboard` or click "Leaderboard" in the navigation

**Features:**
- Top 10 players by total score
- Top 10 players by wins
- Top 10 players by average score
- Medal indicators (🥇🥈🥉) for top 3

---

### 📜 Game History

**Access:** Navigate to `/history` or click "History" in the navigation

**What You'll See:**
- All completed games
- Final scores for each game
- Game duration
- Winner indication (👑)
- Questions answered vs total questions

**Tip:** Games are automatically recorded when marked as complete.

---

### 📈 Statistics Dashboard

**Access:** Navigate to `/statistics` or click "Stats" in the navigation

**Displays:**
- Overall statistics (total players, games, points)
- Average score per game
- Detailed per-player breakdown
- Games played, wins, average score, high score
- Last played date

**How It Updates:** Statistics are automatically updated when games are completed.

---

### 🔍 Search & Filter (Admin)

**Access:** Go to `/admin/questions`

**Search Features:**
- Search by question text
- Search by answer text
- Search by category name
- Real-time filtering

**Filter Options:**
- Filter by category
- Combine search with category filter
- Clear all filters with one click

**Usage:**
1. Type in the search box to filter questions
2. Use the category dropdown to filter by category
3. Click the "X" on filter badges to remove specific filters
4. Click "Clear all" to reset all filters

---

### 💾 Import/Export Data

**Access:** Navigate to `/admin/data`

#### Exporting Data

1. Click "Export All Data" to download all categories and questions
2. Or click individual category export buttons
3. A JSON file will be downloaded to your computer

**Export Format:** JSON file containing categories, questions, and answers

#### Importing Data

1. Choose import mode:
   - **Merge Mode** (recommended): Skips duplicates, keeps existing data
   - **Replace Mode**: Imports everything as new entries

2. Click "Choose File" and select your JSON file
3. The import will process automatically
4. A success message shows categories and questions imported

**Important:** Always backup your data before importing!

**Valid JSON Format:**
```json
{
  "categories": [
    {
      "name": "Category Name",
      "description": "Optional description",
      "color": "#0066CC",
      "questions": [
        {
          "text": "Question text",
          "points": 100,
          "type": "text",
          "answers": [
            {
              "text": "Correct answer",
              "isCorrect": true
            }
          ]
        }
      ]
    }
  ]
}
```

---

### ⏱️ Timer Functionality

**Access:** Use the `Timer` component in question pages

**Usage in Code:**
```typescript
import { Timer } from "~/components/game/Timer";

<Timer
  duration={30}
  onTimeUp={() => handleTimeUp()}
  autoStart={true}
  warningThreshold={10}
  criticalThreshold={5}
/>
```

**Timer States:**
- **Normal** - Blue/default color
- **Warning** - Yellow (at 10s by default)
- **Critical** - Red with pulsing animation (at 5s by default)
- **Expired** - Gray

**Controls:**
- Start - Begin countdown
- Pause - Pause the timer
- Resume - Continue from pause
- Reset - Reset to initial duration

**Settings Hook:**
```typescript
import { useTimerSettings } from "~/components/game/Timer";

const [settings, setSettings] = useTimerSettings();

// Settings structure:
{
  enabled: boolean,
  duration: number, // seconds
  autoStart: boolean
}
```

---

## Admin Workflow

### Setting Up Your Game

1. **Create Categories** (`/admin/categories`)
   - Add game categories with names and colors
   - Optionally add descriptions

2. **Add Questions** (`/admin/questions`)
   - Create questions for each category
   - Choose question type (text, audio, video, image, multiple choice)
   - Set point values (100-500)
   - Add correct answers

3. **Import Data (Optional)** (`/admin/data`)
   - Import questions from JSON files
   - Use merge mode to add to existing data

4. **Export Backup** (`/admin/data`)
   - Export your data for backup
   - Share question sets with others

---

## Playing the Game

### Standard Game Flow

1. **Start New Game** (Home page)
   - Click "Start New Game"
   - You'll be redirected to the game page

2. **Add Players**
   - Enter player names
   - Add all participants before starting

3. **Select Player & Question**
   - Click a player to select them
   - Click a question cell to answer

4. **Answer Question**
   - Read the question
   - Type your answer (text questions)
   - Or select from choices (multiple choice)
   - Submit your answer

5. **View Results**
   - See if the answer was correct
   - Points are added or deducted automatically
   - Return to game board after countdown

6. **Complete Game**
   - Answer all questions or use "Complete Game" button
   - Game is automatically saved to history
   - Statistics are updated

---

## Tracking & Analytics

### How Statistics Work

**Automatic Tracking:**
- Game completion triggers statistics update
- Player stats update after each game
- Answer history records every answer

**What's Tracked:**
- Total games played per player
- Win count
- Total cumulative score
- Average score per game
- Highest single game score
- Questions answered
- Correct answers
- Last played date

**Viewing Stats:**
- `/statistics` - Full dashboard
- `/leaderboard` - Rankings
- `/history` - Past games

---

## Accessibility Features

### Keyboard Navigation

**General Navigation:**
- `Tab` - Move forward through interactive elements
- `Shift + Tab` - Move backward
- `Enter` or `Space` - Activate buttons/links
- `Esc` - Close dialogs/modals

**Skip Links:**
- Press `Tab` when page loads to reveal skip links
- Jump directly to main content
- Jump to navigation

**Form Controls:**
- All forms are keyboard accessible
- Error messages announced to screen readers
- Clear focus indicators on all interactive elements

### Screen Reader Support

**ARIA Landmarks:**
- Main content regions labeled
- Navigation areas identified
- Forms properly labeled

**Live Regions:**
- Score updates announced
- Answer feedback announced
- Timer warnings announced
- Form errors announced

**Tested With:**
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)

---

## Tips & Best Practices

### For Best Experience

1. **Regular Backups**
   - Export your data regularly
   - Keep backup JSON files safe

2. **Theme Selection**
   - Choose a theme that's comfortable for your eyes
   - Classic Jeopardy theme for authentic feel

3. **Statistics Accuracy**
   - Complete games properly to ensure stats are recorded
   - Use consistent player names for accurate tracking

4. **Search Efficiency**
   - Use search to quickly find questions
   - Combine search with category filters for precision

5. **Import Safety**
   - Use merge mode when importing new questions
   - Use replace mode only for fresh imports
   - Always review imported data

---

## Troubleshooting

### Common Issues

**Theme Not Persisting:**
- Check browser localStorage settings
- Ensure cookies are enabled

**Statistics Not Updating:**
- Make sure to complete the game properly
- Check database connection
- Verify game is marked as "completed"

**Import Fails:**
- Validate JSON format
- Check for required fields
- Ensure correct data types

**Search Not Working:**
- Clear browser cache
- Refresh the page
- Check for JavaScript errors in console

---

## Need Help?

- Check the main documentation in `/docs`
- Review feature documentation in `/docs/features`
- See `ENHANCEMENT_FEATURES_SUMMARY.md` for technical details

---

**Enjoy your enhanced Jeopardy experience! 🎮**

