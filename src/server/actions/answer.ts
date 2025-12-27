"use server";

import { db } from "~/server/db";
import { answers, questions, type Answer, type NewAnswer } from "~/server/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// Validation Schemas
// ============================================================================
const createAnswerSchema = z.object({
  questionId: z.number().int().positive("Question ID is required"),
  text: z.string().min(1, "Answer text is required"),
  isCorrect: z.boolean().default(false),
  order: z.number().int().optional().nullable(),
});

const updateAnswerSchema = createAnswerSchema.partial();

// ============================================================================
// Types
// ============================================================================
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Create Answer
// ============================================================================
export async function createAnswer(
  input: NewAnswer
): Promise<ActionResult<Answer>> {
  try {
    const validated = createAnswerSchema.parse(input);

    const [answer] = await db.insert(answers).values(validated).returning();

    if (!answer) {
      return { success: false, error: "Failed to create answer" };
    }

    return { success: true, data: answer };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation error",
      };
    }
    console.error("Error creating answer:", error);
    return { success: false, error: "Failed to create answer" };
  }
}

// ============================================================================
// Create Multiple Answers (for multiple choice questions)
// ============================================================================
export async function createAnswers(
  input: NewAnswer[]
): Promise<ActionResult<Answer[]>> {
  try {
    const validated = input.map((item) => createAnswerSchema.parse(item));

    const createdAnswers = await db
      .insert(answers)
      .values(validated)
      .returning();

    return { success: true, data: createdAnswers };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation error",
      };
    }
    console.error("Error creating answers:", error);
    return { success: false, error: "Failed to create answers" };
  }
}

// ============================================================================
// Get Answers by Question ID (ordered by order field)
// ============================================================================
export async function getAnswersByQuestionId(
  questionId: number
): Promise<ActionResult<Answer[]>> {
  try {
    const result = await db
      .select()
      .from(answers)
      .where(eq(answers.questionId, questionId))
      .orderBy(asc(answers.order));

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching answers:", error);
    return { success: false, error: "Failed to fetch answers" };
  }
}

// ============================================================================
// Get Correct Answer(s) for a Question
// ============================================================================
export async function getCorrectAnswers(
  questionId: number
): Promise<ActionResult<Answer[]>> {
  try {
    const result = await db
      .select()
      .from(answers)
      .where(
        and(eq(answers.questionId, questionId), eq(answers.isCorrect, true))
      );

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching correct answers:", error);
    return { success: false, error: "Failed to fetch correct answers" };
  }
}

// ============================================================================
// Get Answer by ID
// ============================================================================
export async function getAnswerById(
  id: number
): Promise<ActionResult<Answer>> {
  try {
    const [answer] = await db
      .select()
      .from(answers)
      .where(eq(answers.id, id));

    if (!answer) {
      return { success: false, error: "Answer not found" };
    }

    return { success: true, data: answer };
  } catch (error) {
    console.error("Error fetching answer:", error);
    return { success: false, error: "Failed to fetch answer" };
  }
}

// ============================================================================
// Update Answer
// ============================================================================
export async function updateAnswer(
  id: number,
  input: Partial<NewAnswer>
): Promise<ActionResult<Answer>> {
  try {
    const validated = updateAnswerSchema.parse(input);

    const [answer] = await db
      .update(answers)
      .set(validated)
      .where(eq(answers.id, id))
      .returning();

    if (!answer) {
      return { success: false, error: "Answer not found" };
    }

    return { success: true, data: answer };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation error",
      };
    }
    console.error("Error updating answer:", error);
    return { success: false, error: "Failed to update answer" };
  }
}

// ============================================================================
// Delete Answer
// ============================================================================
export async function deleteAnswer(
  id: number
): Promise<ActionResult<{ id: number }>> {
  try {
    const [deleted] = await db
      .delete(answers)
      .where(eq(answers.id, id))
      .returning({ id: answers.id });

    if (!deleted) {
      return { success: false, error: "Answer not found" };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Error deleting answer:", error);
    return { success: false, error: "Failed to delete answer" };
  }
}

// ============================================================================
// Delete All Answers for a Question
// ============================================================================
export async function deleteAnswersByQuestionId(
  questionId: number
): Promise<ActionResult<{ count: number }>> {
  try {
    const deleted = await db
      .delete(answers)
      .where(eq(answers.questionId, questionId))
      .returning({ id: answers.id });

    return { success: true, data: { count: deleted.length } };
  } catch (error) {
    console.error("Error deleting answers:", error);
    return { success: false, error: "Failed to delete answers" };
  }
}

// ============================================================================
// Validate Answer
// ============================================================================
type ValidationResult = {
  isCorrect: boolean;
  correctAnswer?: string;
  points: number;
};

/**
 * Validates a text answer against correct answers for a question
 * Supports case-insensitive matching and whitespace trimming
 */
export async function validateTextAnswer(
  questionId: number,
  submittedAnswer: string
): Promise<ActionResult<ValidationResult>> {
  try {
    // Get the question for points
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId));

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    // Get correct answers
    const correctAnswers = await db
      .select()
      .from(answers)
      .where(
        and(eq(answers.questionId, questionId), eq(answers.isCorrect, true))
      );

    if (correctAnswers.length === 0) {
      return { success: false, error: "No correct answer found for question" };
    }

    // Normalize the submitted answer
    const normalizedSubmission = submittedAnswer.trim().toLowerCase();

    // Check if any correct answer matches
    const isCorrect = correctAnswers.some((answer) => {
      const normalizedCorrect = answer.text.trim().toLowerCase();
      return normalizedSubmission === normalizedCorrect;
    });

    return {
      success: true,
      data: {
        isCorrect,
        correctAnswer: isCorrect ? undefined : correctAnswers[0]?.text,
        points: question.points,
      },
    };
  } catch (error) {
    console.error("Error validating answer:", error);
    return { success: false, error: "Failed to validate answer" };
  }
}

/**
 * Validates a multiple choice answer by checking if the selected answer ID is correct
 */
export async function validateMultipleChoiceAnswer(
  questionId: number,
  selectedAnswerId: number
): Promise<ActionResult<ValidationResult>> {
  try {
    // Get the question for points
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId));

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    // Get the selected answer
    const [selectedAnswer] = await db
      .select()
      .from(answers)
      .where(eq(answers.id, selectedAnswerId));

    if (!selectedAnswer) {
      return { success: false, error: "Answer not found" };
    }

    // Check if selected answer is correct
    const isCorrect = selectedAnswer.isCorrect;

    // If incorrect, get the correct answer
    let correctAnswerText: string | undefined;
    if (!isCorrect) {
      const correctAnswers = await db
        .select()
        .from(answers)
        .where(
          and(eq(answers.questionId, questionId), eq(answers.isCorrect, true))
        );
      correctAnswerText = correctAnswers[0]?.text;
    }

    return {
      success: true,
      data: {
        isCorrect,
        correctAnswer: correctAnswerText,
        points: question.points,
      },
    };
  } catch (error) {
    console.error("Error validating answer:", error);
    return { success: false, error: "Failed to validate answer" };
  }
}

// ============================================================================
// Manual Answer Override
// ============================================================================
/**
 * Manually override the answer validation (for host to force correct/incorrect)
 * This allows the host to manually award or deny points when the answer is close but not exact
 */
export async function manualAnswerOverride(
  questionId: number,
  forceCorrect: boolean
): Promise<ActionResult<ValidationResult>> {
  try {
    // Get the question for points
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId));

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    // Get correct answer for display
    const correctAnswers = await db
      .select()
      .from(answers)
      .where(
        and(eq(answers.questionId, questionId), eq(answers.isCorrect, true))
      );

    return {
      success: true,
      data: {
        isCorrect: forceCorrect,
        correctAnswer: forceCorrect ? undefined : correctAnswers[0]?.text,
        points: question.points,
      },
    };
  } catch (error) {
    console.error("Error processing manual override:", error);
    return { success: false, error: "Failed to process manual override" };
  }
}

