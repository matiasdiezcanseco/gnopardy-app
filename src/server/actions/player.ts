"use server";

import { db } from "~/server/db";
import { players, type Player, type NewPlayer } from "~/server/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// Validation Schemas
// ============================================================================
const createPlayerSchema = z.object({
  name: z.string().min(1, "Player name is required").max(256),
  score: z.number().int().default(0),
  gameId: z.number().int().positive().optional().nullable(),
});

const updatePlayerSchema = createPlayerSchema.partial();

// ============================================================================
// Types
// ============================================================================
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Create Player
// ============================================================================
export async function createPlayer(
  input: NewPlayer
): Promise<ActionResult<Player>> {
  try {
    const validated = createPlayerSchema.parse(input);

    const [player] = await db.insert(players).values(validated).returning();

    if (!player) {
      return { success: false, error: "Failed to create player" };
    }

    return { success: true, data: player };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation error",
      };
    }
    console.error("Error creating player:", error);
    return { success: false, error: "Failed to create player" };
  }
}

// ============================================================================
// Get All Players (optionally filtered by gameId)
// ============================================================================
export async function getPlayers(
  gameId?: number
): Promise<ActionResult<Player[]>> {
  try {
    const query = db.select().from(players).orderBy(desc(players.score));

    const result = gameId
      ? await query.where(eq(players.gameId, gameId))
      : await query;

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching players:", error);
    return { success: false, error: "Failed to fetch players" };
  }
}

// ============================================================================
// Get Player by ID
// ============================================================================
export async function getPlayerById(
  id: number
): Promise<ActionResult<Player>> {
  try {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, id));

    if (!player) {
      return { success: false, error: "Player not found" };
    }

    return { success: true, data: player };
  } catch (error) {
    console.error("Error fetching player:", error);
    return { success: false, error: "Failed to fetch player" };
  }
}

// ============================================================================
// Get Players by Game ID
// ============================================================================
export async function getPlayersByGameId(
  gameId: number
): Promise<ActionResult<Player[]>> {
  try {
    const result = await db
      .select()
      .from(players)
      .where(eq(players.gameId, gameId))
      .orderBy(desc(players.score));

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching players:", error);
    return { success: false, error: "Failed to fetch players" };
  }
}

// ============================================================================
// Update Player
// ============================================================================
export async function updatePlayer(
  id: number,
  input: Partial<NewPlayer>
): Promise<ActionResult<Player>> {
  try {
    const validated = updatePlayerSchema.parse(input);

    const [player] = await db
      .update(players)
      .set(validated)
      .where(eq(players.id, id))
      .returning();

    if (!player) {
      return { success: false, error: "Player not found" };
    }

    return { success: true, data: player };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation error",
      };
    }
    console.error("Error updating player:", error);
    return { success: false, error: "Failed to update player" };
  }
}

// ============================================================================
// Update Player Score (atomic add/subtract points)
// ============================================================================
export async function updatePlayerScore(
  id: number,
  pointsDelta: number
): Promise<ActionResult<Player>> {
  try {
    const [player] = await db
      .update(players)
      .set({
        score: sql`${players.score} + ${pointsDelta}`,
      })
      .where(eq(players.id, id))
      .returning();

    if (!player) {
      return { success: false, error: "Player not found" };
    }

    return { success: true, data: player };
  } catch (error) {
    console.error("Error updating player score:", error);
    return { success: false, error: "Failed to update player score" };
  }
}

// ============================================================================
// Reset Player Score
// ============================================================================
export async function resetPlayerScore(
  id: number
): Promise<ActionResult<Player>> {
  return updatePlayer(id, { score: 0 });
}

// ============================================================================
// Reset All Players' Scores for a Game
// ============================================================================
export async function resetGameScores(
  gameId: number
): Promise<ActionResult<{ count: number }>> {
  try {
    const updated = await db
      .update(players)
      .set({ score: 0 })
      .where(eq(players.gameId, gameId))
      .returning({ id: players.id });

    return { success: true, data: { count: updated.length } };
  } catch (error) {
    console.error("Error resetting game scores:", error);
    return { success: false, error: "Failed to reset game scores" };
  }
}

// ============================================================================
// Delete Player
// ============================================================================
export async function deletePlayer(
  id: number
): Promise<ActionResult<{ id: number }>> {
  try {
    const [deleted] = await db
      .delete(players)
      .where(eq(players.id, id))
      .returning({ id: players.id });

    if (!deleted) {
      return { success: false, error: "Player not found" };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Error deleting player:", error);
    return { success: false, error: "Failed to delete player" };
  }
}

