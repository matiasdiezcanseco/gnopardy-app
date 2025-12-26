// ============================================================================
// Server Actions Export
// ============================================================================

// Category Actions
export {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "./category";

// Question Actions
export {
  createQuestion,
  getQuestions,
  getQuestionById,
  getQuestionsByCategory,
  updateQuestion,
  markQuestionAsAnswered,
  resetQuestion,
  deleteQuestion,
} from "./question";

// Answer Actions
export {
  createAnswer,
  createAnswers,
  getAnswersByQuestionId,
  getCorrectAnswers,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
  deleteAnswersByQuestionId,
  validateTextAnswer,
  validateMultipleChoiceAnswer,
} from "./answer";

// Player Actions
export {
  createPlayer,
  getPlayers,
  getPlayerById,
  getPlayersByGameId,
  updatePlayer,
  updatePlayerScore,
  resetPlayerScore,
  resetGameScores,
  deletePlayer,
} from "./player";

// Game Actions
export {
  createGame,
  getGameById,
  getGames,
  getActiveGames,
  updateGameStatus,
  completeGame,
  updateGame,
  deleteGame,
  resetGame,
} from "./game";

// History and Statistics Actions
export {
  recordGameHistory,
  getGameHistory,
  getGameHistoryById,
  recordAnswerHistory,
  getAnswerHistoryByGame,
  getAnswerHistoryByPlayer,
  updatePlayerStatistics,
  getPlayerStatistics,
  getTopPlayersByScore,
  getTopPlayersByWins,
  getTopPlayersByAverage,
  getAllPlayerStatistics,
} from "./history";

// Import/Export Actions
export {
  exportGameData,
  exportCategoryData,
  importGameData,
  importGameDataMerge,
} from "./import-export";
