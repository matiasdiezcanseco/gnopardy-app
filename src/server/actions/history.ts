"use server";

import { db } from "~/server/db";
import {
  gameHistory,
  answerHistory,
  playerStatistics,
  games,
  players,
  questions,
  type GameHistory,
  type NewGameHistory,
  type AnswerHistory,
  type NewAnswerHistory,
  type PlayerStatistics,
  type NewPlayerStatistics,
} from "~/server/db/schema";
import { eq, desc, sql } from "drizzle-orm";

// ============================================================================
// Types
// ============================================================================
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Game History Functions
// ============================================================================

/**
 * Records a completed game in the game history
 */
export async function recordGameHistory(
  gameId: number
): Promise<ActionResult<GameHistory>> {
  try {
    // Get game details
    const [game] = await db.select().from(games).where(eq(games.id, gameId));

    if (!game) {
      return { success: false, error: "Game not found" };
    }

    // Get all players with their scores for this game
    const gamePlayers = await db
      .select()
      .from(players)
      .where(eq(players.gameId, gameId));

    // Get all questions (to count total questions)
    const allQuestions = await db.select().from(questions);

    // Get answered questions count
    const answeredCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .where(eq(questions.isAnswered, true));

    // Calculate game duration (in seconds)
    const duration = game.completedAt
      ? Math.floor(
          (game.completedAt.getTime() - game.createdAt.getTime()) / 1000
        )
      : 0;

    // Prepare final scores
    const finalScores = gamePlayers.map((player) => ({
      playerId: player.id,
      playerName: player.name,
      score: player.score,
    }));

    // Create game history record
    const [history] = await db
      .insert(gameHistory)
      .values({
        gameId,
        gameName: game.name ?? "Untitled Game",
        finalScores: finalScores as any, // jsonb type
        totalQuestions: allQuestions.length,
        answeredQuestions: Number(answeredCount[0]?.count ?? 0),
        duration,
        completedAt: game.completedAt ?? new Date(),
      })
      .returning();

    // Update player statistics for all players in the game
    for (const player of gamePlayers) {
      await updatePlayerStatistics(player.name, player.score, gameId);
    }

    return { success: true, data: history! };
  } catch (error) {
    console.error("Error recording game history:", error);
    return { success: false, error: "Failed to record game history" };
  }
}

/**
 * Gets all game history records, sorted by completion date
 */
export async function getGameHistory(
  limit = 20
): Promise<ActionResult<GameHistory[]>> {
  try {
    const history = await db
      .select()
      .from(gameHistory)
      .orderBy(desc(gameHistory.completedAt))
      .limit(limit);

    return { success: true, data: history };
  } catch (error) {
    console.error("Error fetching game history:", error);
    return { success: false, error: "Failed to fetch game history" };
  }
}

/**
 * Gets a specific game history record by ID
 */
export async function getGameHistoryById(
  id: number
): Promise<ActionResult<GameHistory>> {
  try {
    const [history] = await db
      .select()
      .from(gameHistory)
      .where(eq(gameHistory.id, id));

    if (!history) {
      return { success: false, error: "Game history not found" };
    }

    return { success: true, data: history };
  } catch (error) {
    console.error("Error fetching game history:", error);
    return { success: false, error: "Failed to fetch game history" };
  }
}

// ============================================================================
// Answer History Functions
// ============================================================================

/**
 * Records an answer in the answer history
 */
export async function recordAnswerHistory(
  input: NewAnswerHistory
): Promise<ActionResult<AnswerHistory>> {
  try {
    const [history] = await db.insert(answerHistory).values(input).returning();

    return { success: true, data: history! };
  } catch (error) {
    console.error("Error recording answer history:", error);
    return { success: false, error: "Failed to record answer history" };
  }
}

/**
 * Gets answer history for a specific game
 */
export async function getAnswerHistoryByGame(
  gameId: number
): Promise<ActionResult<AnswerHistory[]>> {
  try {
    const history = await db
      .select()
      .from(answerHistory)
      .where(eq(answerHistory.gameId, gameId))
      .orderBy(answerHistory.answeredAt);

    return { success: true, data: history };
  } catch (error) {
    console.error("Error fetching answer history:", error);
    return { success: false, error: "Failed to fetch answer history" };
  }
}

/**
 * Gets answer history for a specific player
 */
export async function getAnswerHistoryByPlayer(
  playerId: number
): Promise<ActionResult<AnswerHistory[]>> {
  try {
    const history = await db
      .select()
      .from(answerHistory)
      .where(eq(answerHistory.playerId, playerId))
      .orderBy(desc(answerHistory.answeredAt));

    return { success: true, data: history };
  } catch (error) {
    console.error("Error fetching answer history:", error);
    return { success: false, error: "Failed to fetch answer history" };
  }
}

// ============================================================================
// Player Statistics Functions
// ============================================================================

/**
 * Updates or creates player statistics
 */
export async function updatePlayerStatistics(
  playerName: string,
  scoreEarned: number,
  gameId: number
): Promise<ActionResult<PlayerStatistics>> {
  try {
    // Check if statistics exist for this player
    const [existing] = await db
      .select()
      .from(playerStatistics)
      .where(eq(playerStatistics.playerName, playerName));

    if (existing) {
      // Update existing statistics
      const newTotalGames = existing.totalGames + 1;
      const newTotalScore = existing.totalScore + scoreEarned;
      const newAverageScore = newTotalScore / newTotalGames;
      const newHighestScore = Math.max(existing.highestScore, scoreEarned);

      const [updated] = await db
        .update(playerStatistics)
        .set({
          totalGames: newTotalGames,
          totalScore: newTotalScore,
          averageScore: newAverageScore,
          highestScore: newHighestScore,
          lastPlayed: new Date(),
        })
        .where(eq(playerStatistics.playerName, playerName))
        .returning();

      return { success: true, data: updated! };
    } else {
      // Create new statistics
      const [created] = await db
        .insert(playerStatistics)
        .values({
          playerName,
          totalGames: 1,
          totalScore: scoreEarned,
          averageScore: scoreEarned,
          highestScore: scoreEarned,
          lastPlayed: new Date(),
        })
        .returning();

      return { success: true, data: created! };
    }
  } catch (error) {
    console.error("Error updating player statistics:", error);
    return { success: false, error: "Failed to update player statistics" };
  }
}

/**
 * Gets statistics for a specific player
 */
export async function getPlayerStatistics(
  playerName: string
): Promise<ActionResult<PlayerStatistics | null>> {
  try {
    const [stats] = await db
      .select()
      .from(playerStatistics)
      .where(eq(playerStatistics.playerName, playerName));

    return { success: true, data: stats ?? null };
  } catch (error) {
    console.error("Error fetching player statistics:", error);
    return { success: false, error: "Failed to fetch player statistics" };
  }
}

/**
 * Gets top players by total score
 */
export async function getTopPlayersByScore(
  limit = 10
): Promise<ActionResult<PlayerStatistics[]>> {
  try {
    const topPlayers = await db
      .select()
      .from(playerStatistics)
      .orderBy(desc(playerStatistics.totalScore))
      .limit(limit);

    return { success: true, data: topPlayers };
  } catch (error) {
    console.error("Error fetching top players:", error);
    return { success: false, error: "Failed to fetch top players" };
  }
}

/**
 * Gets top players by win count
 */
export async function getTopPlayersByWins(
  limit = 10
): Promise<ActionResult<PlayerStatistics[]>> {
  try {
    const topPlayers = await db
      .select()
      .from(playerStatistics)
      .orderBy(desc(playerStatistics.totalWins))
      .limit(limit);

    return { success: true, data: topPlayers };
  } catch (error) {
    console.error("Error fetching top players by wins:", error);
    return { success: false, error: "Failed to fetch top players" };
  }
}

/**
 * Gets top players by average score
 */
export async function getTopPlayersByAverage(
  limit = 10
): Promise<ActionResult<PlayerStatistics[]>> {
  try {
    const topPlayers = await db
      .select()
      .from(playerStatistics)
      .orderBy(desc(playerStatistics.averageScore))
      .limit(limit);

    return { success: true, data: topPlayers };
  } catch (error) {
    console.error("Error fetching top players by average:", error);
    return { success: false, error: "Failed to fetch top players" };
  }
}

/**
 * Gets all player statistics
 */
export async function getAllPlayerStatistics(): Promise<
  ActionResult<PlayerStatistics[]>
> {
  try {
    const allStats = await db
      .select()
      .from(playerStatistics)
      .orderBy(desc(playerStatistics.totalScore));

    return { success: true, data: allStats };
  } catch (error) {
    console.error("Error fetching all player statistics:", error);
    return { success: false, error: "Failed to fetch player statistics" };
  }
}

