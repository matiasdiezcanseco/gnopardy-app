"use server";

import { db } from "~/server/db";
import {
  games,
  players,
  questions,
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

    // Reset all questions to unanswered
    const resetQuestions = await db
      .update(questions)
      .set({ isAnswered: false })
      .returning({ id: questions.id });

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

