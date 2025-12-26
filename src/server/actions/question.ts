"use server";

import { db } from "~/server/db";
import {
  questions,
  categories,
  type Question,
  type NewQuestion,
} from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// Validation Schemas
// ============================================================================
const questionTypeEnum = z.enum([
  "text",
  "multiple_choice",
  "audio",
  "video",
  "image",
]);

const validPoints = [100, 200, 300, 400, 500] as const;

const createQuestionSchema = z.object({
  categoryId: z.number().int().positive("Category ID is required"),
  text: z.string().min(1, "Question text is required"),
  points: z
    .number()
    .int()
    .refine(
      (val) => validPoints.includes(val as (typeof validPoints)[number]),
      "Points must be 100, 200, 300, 400, or 500"
    ),
  type: questionTypeEnum.default("text"),
  mediaUrl: z.string().url("Media URL must be a valid URL").optional().nullable(),
  isAnswered: z.boolean().optional(),
});

const updateQuestionSchema = createQuestionSchema.partial();

// ============================================================================
// Types
// ============================================================================
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type QuestionWithCategory = Question & {
  category: { id: number; name: string } | null;
};

// ============================================================================
// Create Question
// ============================================================================
export async function createQuestion(
  input: NewQuestion
): Promise<ActionResult<Question>> {
  try {
    const validated = createQuestionSchema.parse(input);

    const [question] = await db
      .insert(questions)
      .values(validated)
      .returning();

    if (!question) {
      return { success: false, error: "Failed to create question" };
    }

    return { success: true, data: question };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation error",
      };
    }
    console.error("Error creating question:", error);
    return { success: false, error: "Failed to create question" };
  }
}

// ============================================================================
// Get All Questions (with optional category filter)
// ============================================================================
export async function getQuestions(
  categoryId?: number
): Promise<ActionResult<QuestionWithCategory[]>> {
  try {
    const query = db
      .select({
        id: questions.id,
        categoryId: questions.categoryId,
        text: questions.text,
        points: questions.points,
        type: questions.type,
        mediaUrl: questions.mediaUrl,
        isAnswered: questions.isAnswered,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(questions)
      .leftJoin(categories, eq(questions.categoryId, categories.id));

    const result = categoryId
      ? await query.where(eq(questions.categoryId, categoryId))
      : await query;

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching questions:", error);
    return { success: false, error: "Failed to fetch questions" };
  }
}

// ============================================================================
// Get Question by ID (with category info)
// ============================================================================
export async function getQuestionById(
  id: number
): Promise<ActionResult<QuestionWithCategory>> {
  try {
    const [question] = await db
      .select({
        id: questions.id,
        categoryId: questions.categoryId,
        text: questions.text,
        points: questions.points,
        type: questions.type,
        mediaUrl: questions.mediaUrl,
        isAnswered: questions.isAnswered,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(questions)
      .leftJoin(categories, eq(questions.categoryId, categories.id))
      .where(eq(questions.id, id));

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    return { success: true, data: question };
  } catch (error) {
    console.error("Error fetching question:", error);
    return { success: false, error: "Failed to fetch question" };
  }
}

// ============================================================================
// Get Questions by Category
// ============================================================================
export async function getQuestionsByCategory(
  categoryId: number
): Promise<ActionResult<Question[]>> {
  try {
    const result = await db
      .select()
      .from(questions)
      .where(eq(questions.categoryId, categoryId))
      .orderBy(questions.points);

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching questions by category:", error);
    return { success: false, error: "Failed to fetch questions" };
  }
}

// ============================================================================
// Update Question
// ============================================================================
export async function updateQuestion(
  id: number,
  input: Partial<NewQuestion>
): Promise<ActionResult<Question>> {
  try {
    const validated = updateQuestionSchema.parse(input);

    const [question] = await db
      .update(questions)
      .set(validated)
      .where(eq(questions.id, id))
      .returning();

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    return { success: true, data: question };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation error",
      };
    }
    console.error("Error updating question:", error);
    return { success: false, error: "Failed to update question" };
  }
}

// ============================================================================
// Mark Question as Answered
// ============================================================================
export async function markQuestionAsAnswered(
  id: number
): Promise<ActionResult<Question>> {
  return updateQuestion(id, { isAnswered: true });
}

// ============================================================================
// Reset Question (mark as unanswered)
// ============================================================================
export async function resetQuestion(
  id: number
): Promise<ActionResult<Question>> {
  return updateQuestion(id, { isAnswered: false });
}

// ============================================================================
// Delete Question
// ============================================================================
export async function deleteQuestion(
  id: number
): Promise<ActionResult<{ id: number }>> {
  try {
    const [deleted] = await db
      .delete(questions)
      .where(eq(questions.id, id))
      .returning({ id: questions.id });

    if (!deleted) {
      return { success: false, error: "Question not found" };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Error deleting question:", error);
    return { success: false, error: "Failed to delete question" };
  }
}

