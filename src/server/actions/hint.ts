"use server";

import { db } from "~/server/db";
import { questionHints, gameQuestionHints } from "~/server/db/schema";
import { eq, and, asc } from "drizzle-orm";
import type {
  QuestionHint,
  NewQuestionHint,
  GameQuestionHint,
} from "~/server/db/schema";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get all hints for a question, ordered by their sequence
 */
export async function getHintsByQuestionId(
  questionId: number,
): Promise<ActionResult<QuestionHint[]>> {
  try {
    const hints = await db
      .select()
      .from(questionHints)
      .where(eq(questionHints.questionId, questionId))
      .orderBy(asc(questionHints.order));

    return { success: true, data: hints };
  } catch (error) {
    console.error("Error fetching hints:", error);
    return { success: false, error: "Failed to fetch hints" };
  }
}

/**
 * Create a new hint for a question
 */
export async function createHint(
  hint: NewQuestionHint,
): Promise<ActionResult<QuestionHint>> {
  try {
    const [newHint] = await db.insert(questionHints).values(hint).returning();

    if (!newHint) {
      return { success: false, error: "Failed to create hint" };
    }

    return { success: true, data: newHint };
  } catch (error) {
    console.error("Error creating hint:", error);
    return { success: false, error: "Failed to create hint" };
  }
}

/**
 * Update an existing hint
 */
export async function updateHint(
  id: number,
  hint: Partial<NewQuestionHint>,
): Promise<ActionResult<QuestionHint>> {
  try {
    const [updatedHint] = await db
      .update(questionHints)
      .set(hint)
      .where(eq(questionHints.id, id))
      .returning();

    if (!updatedHint) {
      return { success: false, error: "Hint not found" };
    }

    return { success: true, data: updatedHint };
  } catch (error) {
    console.error("Error updating hint:", error);
    return { success: false, error: "Failed to update hint" };
  }
}

/**
 * Delete a hint
 */
export async function deleteHint(id: number): Promise<ActionResult<void>> {
  try {
    await db.delete(questionHints).where(eq(questionHints.id, id));
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting hint:", error);
    return { success: false, error: "Failed to delete hint" };
  }
}

/**
 * Get the IDs of hints that have been revealed for a question in a specific game
 */
export async function getRevealedHints(
  gameId: number,
  questionId: number,
): Promise<ActionResult<number[]>> {
  try {
    const revealed = await db
      .select({ hintId: gameQuestionHints.hintId })
      .from(gameQuestionHints)
      .where(
        and(
          eq(gameQuestionHints.gameId, gameId),
          eq(gameQuestionHints.questionId, questionId),
        ),
      );

    const hintIds = revealed.map((r) => r.hintId);
    return { success: true, data: hintIds };
  } catch (error) {
    console.error("Error fetching revealed hints:", error);
    return { success: false, error: "Failed to fetch revealed hints" };
  }
}

/**
 * Reveal a hint for a question in a game
 */
export async function revealHint(
  gameId: number,
  questionId: number,
  hintId: number,
): Promise<ActionResult<GameQuestionHint>> {
  try {
    // Check if hint is already revealed
    const existing = await db
      .select()
      .from(gameQuestionHints)
      .where(
        and(
          eq(gameQuestionHints.gameId, gameId),
          eq(gameQuestionHints.questionId, questionId),
          eq(gameQuestionHints.hintId, hintId),
        ),
      );

    if (existing.length > 0) {
      return { success: false, error: "Hint already revealed" };
    }

    // Reveal the hint
    const [revealed] = await db
      .insert(gameQuestionHints)
      .values({ gameId, questionId, hintId })
      .returning();

    if (!revealed) {
      return { success: false, error: "Failed to reveal hint" };
    }

    return { success: true, data: revealed };
  } catch (error) {
    console.error("Error revealing hint:", error);
    return { success: false, error: "Failed to reveal hint" };
  }
}

/**
 * Get a single hint by ID
 */
export async function getHintById(
  id: number,
): Promise<ActionResult<QuestionHint>> {
  try {
    const [hint] = await db
      .select()
      .from(questionHints)
      .where(eq(questionHints.id, id));

    if (!hint) {
      return { success: false, error: "Hint not found" };
    }

    return { success: true, data: hint };
  } catch (error) {
    console.error("Error fetching hint:", error);
    return { success: false, error: "Failed to fetch hint" };
  }
}

/**
 * Delete all hints for a question
 */
export async function deleteHintsByQuestionId(
  questionId: number,
): Promise<ActionResult<void>> {
  try {
    await db
      .delete(questionHints)
      .where(eq(questionHints.questionId, questionId));
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting hints:", error);
    return { success: false, error: "Failed to delete hints" };
  }
}

