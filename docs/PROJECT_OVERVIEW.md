# Project Overview 🎮

## What is Jeopardy?

Jeopardy is a modern web-based trivia game inspired by the classic TV game show "Jeopardy!". The application provides an interactive platform for playing trivia with friends, family, or colleagues, featuring customizable categories, multimedia questions, and real-time score tracking.

## Core Concept

The game follows the traditional Jeopardy format where:

1. **Categories** are displayed on a main dashboard/game board
2. **Questions** within each category have varying point values (difficulty levels)
3. **Players** select a category and point value to reveal a question
4. **Answers** are submitted and validated for correctness
5. **Scores** are updated based on correct/incorrect responses

## Key Features

### 🎯 Game Board Dashboard

The main interface displays a grid of categories and questions:

- Multiple categories arranged in columns
- Questions arranged by point value (e.g., 100, 200, 300, 400, 500)
- Visual indicators for answered vs. unanswered questions
- Clean, intuitive navigation

### ❓ Question Types

Jeopardy supports various question formats:

| Type                | Description                                         |
| ------------------- | --------------------------------------------------- |
| **Text Only**       | Standard text-based trivia questions                |
| **Multiple Choice** | Questions with selectable answer options            |
| **Audio**           | Questions that include audio clips to listen to     |
| **Video**           | Questions featuring video content to watch          |
| **Image**           | Questions with visual elements or image-based clues |

### 📊 Scoring System

- Points are awarded for correct answers
- Point values correspond to question difficulty
- Real-time score tracking and display
- Support for multiple players/teams

### 🎨 User Experience

- Responsive design for desktop and mobile
- Smooth transitions between game states
- Clear feedback for correct/incorrect answers
- Accessible and intuitive interface

## Game Flow

```
┌─────────────────┐
│   Game Board    │
│  (Categories)   │
└────────┬────────┘
         │
         ▼ Select Question
┌─────────────────┐
│ Question View   │
│ (Media/Text)    │
└────────┬────────┘
         │
         ▼ Submit Answer
┌─────────────────┐
│ Answer Result   │
│ (Right/Wrong)   │
└────────┬────────┘
         │
         ▼ Update Score
┌─────────────────┐
│   Game Board    │
│ (Updated State) │
└─────────────────┘
```

## User Stories

### As a Game Host

- I can create custom categories and questions
- I can add multimedia content to questions
- I can set point values for each question
- I can manage multiple game sessions

### As a Player

- I can view the game board with all categories
- I can select questions based on category and point value
- I can watch/listen to multimedia content
- I can submit answers (text or multiple choice)
- I can see immediate feedback on my answers
- I can track my score throughout the game

## Future Considerations

Potential features for future development:

- **Multiplayer Mode**: Real-time competitive play
- **Game History**: Track past games and statistics
- **Custom Themes**: Personalize the game board appearance
- **Timer Mode**: Add time limits for answering
- **Daily Double**: Special high-value questions
- **Final Jeopardy**: End-game wagering round
- **Leaderboards**: Global and friends rankings
- **Category Packs**: Pre-made question sets by topic

## Target Audience

- Trivia enthusiasts
- Educators and teachers
- Team building facilitators
- Families and friend groups
- Event organizers

---

_Jeopardy brings the excitement of classic trivia to your browser with modern web technologies._
