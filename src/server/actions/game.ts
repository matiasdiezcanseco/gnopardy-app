"use server";

import { db } from "~/server/db";
import {
  games,
  players,
  questions,
  categories,
  gameQuestions,
  type Game,
  type NewGame,
  type Player,
} from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// Validation Schemas
// ============================================================================
const gameStatusEnum = z.enum(["active", "completed"]);

const createGameSchema = z.object({
  name: z.string().max(256).optional().nullable(),
  status: gameStatusEnum.default("active"),
});

const updateGameSchema = createGameSchema.partial();

// ============================================================================
// Types
// ============================================================================
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type GameWithPlayers = Game & {
  players: Player[];
};

// ============================================================================
// Create Game
// ============================================================================
export async function createGame(
  input?: Partial<NewGame>
): Promise<ActionResult<Game>> {
  try {
    const validated = createGameSchema.parse(input ?? {});

    const [game] = await db.insert(games).values(validated).returning();

    if (!game) {
      return { success: false, error: "Failed to create game" };
    }

    // Initialize all questions for this game in the game_questions table
    const allQuestions = await db.select({ id: questions.id }).from(questions);
    
    if (allQuestions.length > 0) {
      await db.insert(gameQuestions).values(
        allQuestions.map((q) => ({
          gameId: game.id,
          questionId: q.id,
          isAnswered: false,
        }))
      );
    }

    return { success: true, data: game };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation error",
      };
    }
    console.error("Error creating game:", error);
    return { success: false, error: "Failed to create game" };
  }
}

// ============================================================================
// Get Game by ID (with players)
// ============================================================================
export async function getGameById(
  id: number
): Promise<ActionResult<GameWithPlayers>> {
  try {
    const [game] = await db.select().from(games).where(eq(games.id, id));

    if (!game) {
      return { success: false, error: "Game not found" };
    }

    const gamePlayers = await db
      .select()
      .from(players)
      .where(eq(players.gameId, id));

    return { success: true, data: { ...game, players: gamePlayers } };
  } catch (error) {
    console.error("Error fetching game:", error);
    return { success: false, error: "Failed to fetch game" };
  }
}

// ============================================================================
// Get All Games
// ============================================================================
export async function getGames(): Promise<ActionResult<Game[]>> {
  try {
    const allGames = await db.select().from(games);
    return { success: true, data: allGames };
  } catch (error) {
    console.error("Error fetching games:", error);
    return { success: false, error: "Failed to fetch games" };
  }
}

// ============================================================================
// Get Active Games
// ============================================================================
export async function getActiveGames(): Promise<ActionResult<Game[]>> {
  try {
    const activeGames = await db
      .select()
      .from(games)
      .where(eq(games.status, "active"));

    return { success: true, data: activeGames };
  } catch (error) {
    console.error("Error fetching active games:", error);
    return { success: false, error: "Failed to fetch active games" };
  }
}

// ============================================================================
// Update Game Status
// ============================================================================
export async function updateGameStatus(
  id: number,
  status: "active" | "completed"
): Promise<ActionResult<Game>> {
  try {
    const validated = gameStatusEnum.parse(status);

    const updateData: Partial<Game> = { status: validated };

    // Add completedAt timestamp when completing a game
    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    const [game] = await db
      .update(games)
      .set(updateData)
      .where(eq(games.id, id))
      .returning();

    if (!game) {
      return { success: false, error: "Game not found" };
    }

    return { success: true, data: game };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation error",
      };
    }
    console.error("Error updating game status:", error);
    return { success: false, error: "Failed to update game status" };
  }
}

// ============================================================================
// Complete Game
// ============================================================================
export async function completeGame(id: number): Promise<ActionResult<Game>> {
  return updateGameStatus(id, "completed");
}

// ============================================================================
// Update Game
// ============================================================================
export async function updateGame(
  id: number,
  input: Partial<NewGame>
): Promise<ActionResult<Game>> {
  try {
    const validated = updateGameSchema.parse(input);

    const [game] = await db
      .update(games)
      .set(validated)
      .where(eq(games.id, id))
      .returning();

    if (!game) {
      return { success: false, error: "Game not found" };
    }

    return { success: true, data: game };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation error",
      };
    }
    console.error("Error updating game:", error);
    return { success: false, error: "Failed to update game" };
  }
}

// ============================================================================
// Delete Game (cascade deletes players due to foreign key)
// ============================================================================
export async function deleteGame(
  id: number
): Promise<ActionResult<{ id: number }>> {
  try {
    const [deleted] = await db
      .delete(games)
      .where(eq(games.id, id))
      .returning({ id: games.id });

    if (!deleted) {
      return { success: false, error: "Game not found" };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Error deleting game:", error);
    return { success: false, error: "Failed to delete game" };
  }
}

// ============================================================================
// Check Game Completion
// ============================================================================
export async function checkGameCompletion(
  id: number
): Promise<ActionResult<{ isComplete: boolean; winner?: Player | null }>> {
  try {
    // Get all questions for this specific game
    const gameQuestionsData = await db
      .select()
      .from(gameQuestions)
      .where(eq(gameQuestions.gameId, id));

    // Check if all questions are answered for this game
    const unansweredCount = gameQuestionsData.filter((gq) => !gq.isAnswered).length;
    const isComplete = gameQuestionsData.length > 0 && unansweredCount === 0;

    if (!isComplete) {
      return { success: true, data: { isComplete: false } };
    }

    // Get the game to check if it's already marked as completed
    const [game] = await db.select().from(games).where(eq(games.id, id));

    if (!game) {
      return { success: false, error: "Game not found" };
    }

    // If game is not yet completed, mark it as completed
    if (game.status !== "completed") {
      await updateGameStatus(id, "completed");
    }

    // Get all players and find winner
    const gamePlayers = await db
      .select()
      .from(players)
      .where(eq(players.gameId, id));

    const winner =
      gamePlayers.length > 0
        ? gamePlayers.reduce((prev, current) =>
            prev.score > current.score ? prev : current
          )
        : null;

    return { success: true, data: { isComplete: true, winner } };
  } catch (error) {
    console.error("Error checking game completion:", error);
    return { success: false, error: "Failed to check game completion" };
  }
}

// ============================================================================
// Reset Game (reset all question states and player scores)
// ============================================================================
export async function resetGame(
  id: number
): Promise<ActionResult<{ questionsReset: number; playersReset: number }>> {
  try {
    // Verify game exists
    const [game] = await db.select().from(games).where(eq(games.id, id));

    if (!game) {
      return { success: false, error: "Game not found" };
    }

    // Reset all questions for this game to unanswered
    const resetQuestions = await db
      .update(gameQuestions)
      .set({ isAnswered: false, answeredAt: null })
      .where(eq(gameQuestions.gameId, id))
      .returning({ id: gameQuestions.id });

    // Reset all player scores for this game
    const resetPlayers = await db
      .update(players)
      .set({ score: 0 })
      .where(eq(players.gameId, id))
      .returning({ id: players.id });

    // Reset game status to active
    await db
      .update(games)
      .set({ status: "active", completedAt: null })
      .where(eq(games.id, id));

    return {
      success: true,
      data: {
        questionsReset: resetQuestions.length,
        playersReset: resetPlayers.length,
      },
    };
  } catch (error) {
    console.error("Error resetting game:", error);
    return { success: false, error: "Failed to reset game" };
  }
}

// ============================================================================
// Get Game Questions (questions with per-game answered status)
// ============================================================================
export async function getGameQuestions(gameId: number): Promise<
  ActionResult<
    Array<{
      id: number;
      categoryId: number;
      text: string;
      points: number;
      type: string;
      mediaUrl: string | null;
      isAnswered: boolean;
      createdAt: Date;
      updatedAt: Date | null;
      category: { id: number; name: string } | null;
    }>
  >
> {
  try {
    // Get all questions with their per-game answered status and category info
    const result = await db
      .select({
        id: questions.id,
        categoryId: questions.categoryId,
        text: questions.text,
        points: questions.points,
        type: questions.type,
        mediaUrl: questions.mediaUrl,
        isAnswered: gameQuestions.isAnswered,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
        categoryName: categories.name,
        categoryIdFromCategory: categories.id,
      })
      .from(questions)
      .leftJoin(
        gameQuestions,
        and(
          eq(gameQuestions.questionId, questions.id),
          eq(gameQuestions.gameId, gameId)
        )
      )
      .leftJoin(categories, eq(questions.categoryId, categories.id));

    // Map results to include category object
    const questionsWithStatus = result.map((q) => ({
      id: q.id,
      categoryId: q.categoryId,
      text: q.text,
      points: q.points,
      type: q.type,
      mediaUrl: q.mediaUrl,
      isAnswered: q.isAnswered ?? false,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      category:
        q.categoryIdFromCategory && q.categoryName
          ? { id: q.categoryIdFromCategory, name: q.categoryName }
          : null,
    }));

    return { success: true, data: questionsWithStatus };
  } catch (error) {
    console.error("Error fetching game questions:", error);
    return { success: false, error: "Failed to fetch game questions" };
  }
}

// ============================================================================
// Check if Question is Answered in Game
// ============================================================================
export async function isQuestionAnsweredInGame(
  gameId: number,
  questionId: number
): Promise<ActionResult<boolean>> {
  try {
    const [gameQuestion] = await db
      .select()
      .from(gameQuestions)
      .where(
        and(
          eq(gameQuestions.gameId, gameId),
          eq(gameQuestions.questionId, questionId)
        )
      );

    return { success: true, data: gameQuestion?.isAnswered ?? false };
  } catch (error) {
    console.error("Error checking question status:", error);
    return { success: false, error: "Failed to check question status" };
  }
}

// ============================================================================
// Mark Question as Answered in Game
// ============================================================================
export async function markQuestionAsAnsweredInGame(
  gameId: number,
  questionId: number
): Promise<ActionResult<{ success: boolean }>> {
  try {
    // First, check if the game question record exists
    const [existingGameQuestion] = await db
      .select()
      .from(gameQuestions)
      .where(
        and(
          eq(gameQuestions.gameId, gameId),
          eq(gameQuestions.questionId, questionId)
        )
      );

    if (existingGameQuestion) {
      // Update existing record
      await db
        .update(gameQuestions)
        .set({ isAnswered: true, answeredAt: new Date() })
        .where(
          and(
            eq(gameQuestions.gameId, gameId),
            eq(gameQuestions.questionId, questionId)
          )
        );
    } else {
      // Insert new record (for questions created after the game)
      await db.insert(gameQuestions).values({
        gameId,
        questionId,
        isAnswered: true,
        answeredAt: new Date(),
      });
    }

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error marking question as answered:", error);
    return { success: false, error: "Failed to mark question as answered" };
  }
}

