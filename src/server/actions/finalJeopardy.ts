"use server";

import { db } from "~/server/db";
import {
  finalJeopardyWagers,
  players,
  questions,
  categories,
  answers,
  type FinalJeopardyWager,
  type NewFinalJeopardyWager,
} from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// Validation Schemas
// ============================================================================
const createWagerSchema = z.object({
  gameId: z.number(),
  playerId: z.number(),
  questionId: z.number(),
  wagerAmount: z.number().min(0),
});

// ============================================================================
// Types
// ============================================================================
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Get Final Jeopardy Question
// ============================================================================
export async function getFinalJeopardyQuestion(): Promise<
  ActionResult<{
    question: {
      id: number;
      text: string;
      type: string;
      mediaUrl: string | null;
      categoryName: string;
    } | null;
  }>
> {
  try {
    // Get the Final Jeopardy category
    const [finalCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.isFinalJeopardy, true))
      .limit(1);

    if (!finalCategory) {
      return { success: true, data: { question: null } };
    }

    // Get the question for this category
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.categoryId, finalCategory.id))
      .limit(1);

    if (!question) {
      return { success: true, data: { question: null } };
    }

    return {
      success: true,
      data: {
        question: {
          id: question.id,
          text: question.text,
          type: question.type,
          mediaUrl: question.mediaUrl,
          categoryName: finalCategory.name,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching Final Jeopardy question:", error);
    return {
      success: false,
      error: "Failed to fetch Final Jeopardy question",
    };
  }
}

// ============================================================================
// Create Wager
// ============================================================================
export async function createWager(
  input: NewFinalJeopardyWager,
): Promise<ActionResult<FinalJeopardyWager>> {
  try {
    const validated = createWagerSchema.parse(input);

    // Check if player already has a wager for this question
    const [existing] = await db
      .select()
      .from(finalJeopardyWagers)
      .where(
        and(
          eq(finalJeopardyWagers.gameId, validated.gameId),
          eq(finalJeopardyWagers.playerId, validated.playerId),
          eq(finalJeopardyWagers.questionId, validated.questionId),
        ),
      );

    if (existing) {
      // Update existing wager if they haven't answered yet
      if (!existing.hasAnswered) {
        const [updated] = await db
          .update(finalJeopardyWagers)
          .set({ wagerAmount: validated.wagerAmount })
          .where(eq(finalJeopardyWagers.id, existing.id))
          .returning();

        if (!updated) {
          return { success: false, error: "Failed to update wager" };
        }

        return { success: true, data: updated };
      } else {
        return { success: false, error: "Cannot change wager after answering" };
      }
    }

    // Get player's current score to validate wager
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, validated.playerId));

    if (!player) {
      return { success: false, error: "Player not found" };
    }

    // Validate wager amount (can't wager more than current score if positive)
    if (player.score > 0 && validated.wagerAmount > player.score) {
      return {
        success: false,
        error: "Wager amount cannot exceed current score",
      };
    }

    // If player has negative or zero score, allow wagering up to a reasonable amount
    // (following real Jeopardy rules, they can wager any amount up to max in the game)
    const maxWagerForZeroScore = 1000; // Or get from game settings
    if (player.score <= 0 && validated.wagerAmount > maxWagerForZeroScore) {
      return {
        success: false,
        error: `Maximum wager when score is zero or negative is $${maxWagerForZeroScore}`,
      };
    }

    const [wager] = await db
      .insert(finalJeopardyWagers)
      .values({
        gameId: validated.gameId,
        playerId: validated.playerId,
        questionId: validated.questionId,
        wagerAmount: validated.wagerAmount,
        hasAnswered: false,
      })
      .returning();

    if (!wager) {
      return { success: false, error: "Failed to create wager" };
    }

    return { success: true, data: wager };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation error",
      };
    }
    console.error("Error creating wager:", error);
    return { success: false, error: "Failed to create wager" };
  }
}

// ============================================================================
// Submit Answer
// ============================================================================
export async function submitFinalJeopardyAnswer(
  wagerId: number,
  submittedAnswer: string,
): Promise<ActionResult<{ wager: FinalJeopardyWager; newScore: number }>> {
  try {
    // Get the wager
    const [wager] = await db
      .select()
      .from(finalJeopardyWagers)
      .where(eq(finalJeopardyWagers.id, wagerId));

    if (!wager) {
      return { success: false, error: "Wager not found" };
    }

    if (wager.hasAnswered) {
      return { success: false, error: "Answer already submitted" };
    }

    // Get the correct answer(s)
    const correctAnswers = await db
      .select()
      .from(answers)
      .where(
        and(
          eq(answers.questionId, wager.questionId),
          eq(answers.isCorrect, true),
        ),
      );

    if (correctAnswers.length === 0) {
      return { success: false, error: "No correct answer found for question" };
    }

    // Check if answer is correct (case-insensitive)
    const isCorrect = correctAnswers.some(
      (ans) =>
        ans.text.toLowerCase().trim() === submittedAnswer.toLowerCase().trim(),
    );

    // Update the wager
    const [updatedWager] = await db
      .update(finalJeopardyWagers)
      .set({
        submittedAnswer,
        isCorrect,
        hasAnswered: true,
        answeredAt: new Date(),
      })
      .where(eq(finalJeopardyWagers.id, wagerId))
      .returning();

    if (!updatedWager) {
      return { success: false, error: "Failed to update wager" };
    }

    // Update player score
    // Correct: add wager amount
    // Incorrect: subtract wager amount
    const scoreChange = isCorrect ? wager.wagerAmount : -wager.wagerAmount;

    // Get current player score and calculate new score
    const [currentPlayer] = await db
      .select()
      .from(players)
      .where(eq(players.id, wager.playerId));

    if (!currentPlayer) {
      return { success: false, error: "Player not found" };
    }

    const newScore = currentPlayer.score + scoreChange;

    const [updatedPlayer] = await db
      .update(players)
      .set({ score: newScore })
      .where(eq(players.id, wager.playerId))
      .returning();

    if (!updatedPlayer) {
      return { success: false, error: "Failed to update player score" };
    }

    return {
      success: true,
      data: { wager: updatedWager, newScore: updatedPlayer.score },
    };
  } catch (error) {
    console.error("Error submitting Final Jeopardy answer:", error);
    return { success: false, error: "Failed to submit answer" };
  }
}

// ============================================================================
// Validate Answer (for host to manually check)
// ============================================================================
export async function validateFinalJeopardyAnswer(
  wagerId: number,
  isCorrect: boolean,
): Promise<ActionResult<{ wager: FinalJeopardyWager; newScore: number }>> {
  try {
    // Get the wager
    const [wager] = await db
      .select()
      .from(finalJeopardyWagers)
      .where(eq(finalJeopardyWagers.id, wagerId));

    if (!wager) {
      return { success: false, error: "Wager not found" };
    }

    // If already validated, don't update score again
    if (wager.isCorrect !== null) {
      return { success: false, error: "Answer already validated" };
    }

    // Update the wager with validation result and mark as answered
    const [updatedWager] = await db
      .update(finalJeopardyWagers)
      .set({
        isCorrect,
        hasAnswered: true,
        answeredAt: new Date(),
      })
      .where(eq(finalJeopardyWagers.id, wagerId))
      .returning();

    if (!updatedWager) {
      return { success: false, error: "Failed to update wager" };
    }

    // Update player score
    const scoreChange = isCorrect ? wager.wagerAmount : -wager.wagerAmount;

    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, wager.playerId));

    if (!player) {
      return { success: false, error: "Player not found" };
    }

    const newScore = player.score + scoreChange;

    const [updatedPlayer] = await db
      .update(players)
      .set({ score: newScore })
      .where(eq(players.id, wager.playerId))
      .returning();

    if (!updatedPlayer) {
      return { success: false, error: "Failed to update player score" };
    }

    return {
      success: true,
      data: { wager: updatedWager, newScore: updatedPlayer.score },
    };
  } catch (error) {
    console.error("Error validating Final Jeopardy answer:", error);
    return { success: false, error: "Failed to validate answer" };
  }
}

// ============================================================================
// Get Wagers for Game
// ============================================================================
export async function getFinalJeopardyWagers(
  gameId: number,
  questionId: number,
): Promise<
  ActionResult<
    Array<
      FinalJeopardyWager & {
        player: { id: number; name: string; score: number };
      }
    >
  >
> {
  try {
    const wagers = await db
      .select({
        id: finalJeopardyWagers.id,
        gameId: finalJeopardyWagers.gameId,
        playerId: finalJeopardyWagers.playerId,
        questionId: finalJeopardyWagers.questionId,
        wagerAmount: finalJeopardyWagers.wagerAmount,
        submittedAnswer: finalJeopardyWagers.submittedAnswer,
        isCorrect: finalJeopardyWagers.isCorrect,
        hasAnswered: finalJeopardyWagers.hasAnswered,
        createdAt: finalJeopardyWagers.createdAt,
        answeredAt: finalJeopardyWagers.answeredAt,
        playerName: players.name,
        playerScore: players.score,
      })
      .from(finalJeopardyWagers)
      .leftJoin(players, eq(finalJeopardyWagers.playerId, players.id))
      .where(
        and(
          eq(finalJeopardyWagers.gameId, gameId),
          eq(finalJeopardyWagers.questionId, questionId),
        ),
      );

    const result = wagers.map((w) => ({
      id: w.id,
      gameId: w.gameId,
      playerId: w.playerId,
      questionId: w.questionId,
      wagerAmount: w.wagerAmount,
      submittedAnswer: w.submittedAnswer,
      isCorrect: w.isCorrect,
      hasAnswered: w.hasAnswered,
      createdAt: w.createdAt,
      answeredAt: w.answeredAt,
      player: {
        id: w.playerId,
        name: w.playerName ?? "Unknown",
        score: w.playerScore ?? 0,
      },
    }));

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching Final Jeopardy wagers:", error);
    return { success: false, error: "Failed to fetch wagers" };
  }
}

// ============================================================================
// Get Player's Wager
// ============================================================================
export async function getPlayerWager(
  gameId: number,
  playerId: number,
  questionId: number,
): Promise<ActionResult<FinalJeopardyWager | null>> {
  try {
    const [wager] = await db
      .select()
      .from(finalJeopardyWagers)
      .where(
        and(
          eq(finalJeopardyWagers.gameId, gameId),
          eq(finalJeopardyWagers.playerId, playerId),
          eq(finalJeopardyWagers.questionId, questionId),
        ),
      );

    return { success: true, data: wager ?? null };
  } catch (error) {
    console.error("Error fetching player wager:", error);
    return { success: false, error: "Failed to fetch wager" };
  }
}

// ============================================================================
// Check if All Players Have Answered
// ============================================================================
export async function checkAllPlayersAnswered(
  gameId: number,
  questionId: number,
): Promise<
  ActionResult<{ allAnswered: boolean; total: number; answered: number }>
> {
  try {
    // Get all players in the game
    const gamePlayers = await db
      .select()
      .from(players)
      .where(eq(players.gameId, gameId));

    // Get all wagers that have been answered
    const answeredWagers = await db
      .select()
      .from(finalJeopardyWagers)
      .where(
        and(
          eq(finalJeopardyWagers.gameId, gameId),
          eq(finalJeopardyWagers.questionId, questionId),
          eq(finalJeopardyWagers.hasAnswered, true),
        ),
      );

    const total = gamePlayers.length;
    const answered = answeredWagers.length;
    const allAnswered = total > 0 && answered === total;

    return {
      success: true,
      data: { allAnswered, total, answered },
    };
  } catch (error) {
    console.error("Error checking if all players answered:", error);
    return { success: false, error: "Failed to check answer status" };
  }
}
