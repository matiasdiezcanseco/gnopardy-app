"use server";

import { db } from "~/server/db";
import { categories, questions, answers } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

// ============================================================================
// Types
// ============================================================================
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

interface ExportData {
  version: string;
  exportDate: string;
  categories: Array<{
    id: number;
    name: string;
    description: string | null;
    color: string | null;
    questions: Array<{
      id: number;
      text: string;
      points: number;
      type: string;
      mediaUrl: string | null;
      answers: Array<{
        id: number;
        text: string;
        isCorrect: boolean;
        order: number | null;
      }>;
    }>;
  }>;
}

interface ImportData {
  categories: Array<{
    name: string;
    description?: string | null;
    color?: string | null;
    questions?: Array<{
      text: string;
      points: number;
      type: string;
      mediaUrl?: string | null;
      answers: Array<{
        text: string;
        isCorrect: boolean;
        order?: number | null;
      }>;
    }>;
  }>;
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Exports all game data (categories, questions, answers) to JSON format
 */
export async function exportGameData(): Promise<ActionResult<ExportData>> {
  try {
    // Fetch all categories
    const allCategories = await db.select().from(categories);

    // Build export data with nested questions and answers
    const exportData: ExportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      categories: [],
    };

    for (const category of allCategories) {
      // Get questions for this category
      const categoryQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.categoryId, category.id));

      const questionsWithAnswers = [];

      for (const question of categoryQuestions) {
        // Get answers for this question
        const questionAnswers = await db
          .select()
          .from(answers)
          .where(eq(answers.questionId, question.id));

        questionsWithAnswers.push({
          id: question.id,
          text: question.text,
          points: question.points,
          type: question.type,
          mediaUrl: question.mediaUrl,
          answers: questionAnswers.map((a) => ({
            id: a.id,
            text: a.text,
            isCorrect: a.isCorrect,
            order: a.order,
          })),
        });
      }

      exportData.categories.push({
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
        questions: questionsWithAnswers,
      });
    }

    return { success: true, data: exportData };
  } catch (error) {
    console.error("Error exporting game data:", error);
    return { success: false, error: "Failed to export game data" };
  }
}

/**
 * Exports data for a specific category
 */
export async function exportCategoryData(
  categoryId: number
): Promise<ActionResult<ExportData>> {
  try {
    // Fetch the category
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId));

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    // Get questions for this category
    const categoryQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.categoryId, categoryId));

    const questionsWithAnswers = [];

    for (const question of categoryQuestions) {
      // Get answers for this question
      const questionAnswers = await db
        .select()
        .from(answers)
        .where(eq(answers.questionId, question.id));

      questionsWithAnswers.push({
        id: question.id,
        text: question.text,
        points: question.points,
        type: question.type,
        mediaUrl: question.mediaUrl,
        answers: questionAnswers.map((a) => ({
          id: a.id,
          text: a.text,
          isCorrect: a.isCorrect,
          order: a.order,
        })),
      });
    }

    const exportData: ExportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      categories: [
        {
          id: category.id,
          name: category.name,
          description: category.description,
          color: category.color,
          questions: questionsWithAnswers,
        },
      ],
    };

    return { success: true, data: exportData };
  } catch (error) {
    console.error("Error exporting category data:", error);
    return { success: false, error: "Failed to export category data" };
  }
}

// ============================================================================
// Import Functions
// ============================================================================

/**
 * Validates import data structure
 */
function validateImportData(data: any): data is ImportData {
  if (!data || typeof data !== "object") return false;
  if (!Array.isArray(data.categories)) return false;

  for (const category of data.categories) {
    if (!category.name || typeof category.name !== "string") return false;

    if (category.questions) {
      if (!Array.isArray(category.questions)) return false;

      for (const question of category.questions) {
        if (!question.text || typeof question.text !== "string") return false;
        if (typeof question.points !== "number") return false;
        if (!question.type || typeof question.type !== "string") return false;
        if (!Array.isArray(question.answers)) return false;

        for (const answer of question.answers) {
          if (!answer.text || typeof answer.text !== "string") return false;
          if (typeof answer.isCorrect !== "boolean") return false;
        }
      }
    }
  }

  return true;
}

/**
 * Imports game data from JSON
 */
export async function importGameData(
  jsonData: string
): Promise<ActionResult<{ categoriesCreated: number; questionsCreated: number }>> {
  try {
    // Parse JSON
    const data = JSON.parse(jsonData);

    // Validate data structure
    if (!validateImportData(data)) {
      return { success: false, error: "Invalid import data format" };
    }

    let categoriesCreated = 0;
    let questionsCreated = 0;

    // Import each category with its questions
    for (const categoryData of data.categories) {
      // Create category
      const [newCategory] = await db
        .insert(categories)
        .values({
          name: categoryData.name,
          description: categoryData.description,
          color: categoryData.color,
        })
        .returning();

      categoriesCreated++;

      // Create questions for this category
      if (categoryData.questions) {
        for (const questionData of categoryData.questions) {
          const [newQuestion] = await db
            .insert(questions)
            .values({
              categoryId: newCategory!.id,
              text: questionData.text,
              points: questionData.points,
              type: questionData.type,
              mediaUrl: questionData.mediaUrl,
            })
            .returning();

          questionsCreated++;

          // Create answers for this question
          for (const answerData of questionData.answers) {
            await db.insert(answers).values({
              questionId: newQuestion!.id,
              text: answerData.text,
              isCorrect: answerData.isCorrect,
              order: answerData.order,
            });
          }
        }
      }
    }

    return {
      success: true,
      data: { categoriesCreated, questionsCreated },
    };
  } catch (error) {
    console.error("Error importing game data:", error);
    if (error instanceof SyntaxError) {
      return { success: false, error: "Invalid JSON format" };
    }
    return { success: false, error: "Failed to import game data" };
  }
}

/**
 * Imports data and merges with existing data (skips duplicates by name)
 */
export async function importGameDataMerge(
  jsonData: string
): Promise<ActionResult<{ categoriesCreated: number; questionsCreated: number }>> {
  try {
    // Parse JSON
    const data = JSON.parse(jsonData);

    // Validate data structure
    if (!validateImportData(data)) {
      return { success: false, error: "Invalid import data format" };
    }

    let categoriesCreated = 0;
    let questionsCreated = 0;

    // Import each category with its questions
    for (const categoryData of data.categories) {
      // Check if category already exists
      const [existingCategory] = await db
        .select()
        .from(categories)
        .where(eq(categories.name, categoryData.name));

      let categoryId: number;

      if (existingCategory) {
        // Use existing category
        categoryId = existingCategory.id;
      } else {
        // Create new category
        const [newCategory] = await db
          .insert(categories)
          .values({
            name: categoryData.name,
            description: categoryData.description,
            color: categoryData.color,
          })
          .returning();

        categoryId = newCategory!.id;
        categoriesCreated++;
      }

      // Create questions for this category
      if (categoryData.questions) {
        for (const questionData of categoryData.questions) {
          // Check if question with same text exists in this category
          const [existingQuestion] = await db
            .select()
            .from(questions)
            .where(and(eq(questions.categoryId, categoryId), eq(questions.text, questionData.text)));

          if (existingQuestion) {
            // Skip duplicate question
            continue;
          }

          const [newQuestion] = await db
            .insert(questions)
            .values({
              categoryId,
              text: questionData.text,
              points: questionData.points,
              type: questionData.type,
              mediaUrl: questionData.mediaUrl,
            })
            .returning();

          questionsCreated++;

          // Create answers for this question
          for (const answerData of questionData.answers) {
            await db.insert(answers).values({
              questionId: newQuestion!.id,
              text: answerData.text,
              isCorrect: answerData.isCorrect,
              order: answerData.order,
            });
          }
        }
      }
    }

    return {
      success: true,
      data: { categoriesCreated, questionsCreated },
    };
  } catch (error) {
    console.error("Error importing game data:", error);
    if (error instanceof SyntaxError) {
      return { success: false, error: "Invalid JSON format" };
    }
    return { success: false, error: "Failed to import game data" };
  }
}

