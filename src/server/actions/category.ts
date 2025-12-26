"use server";

import { db } from "~/server/db";
import { categories, type Category, type NewCategory } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// Validation Schemas
// ============================================================================
const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(256),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code (e.g., #FF5733)")
    .optional(),
});

const updateCategorySchema = createCategorySchema.partial();

// ============================================================================
// Types
// ============================================================================
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Create Category
// ============================================================================
export async function createCategory(
  input: NewCategory
): Promise<ActionResult<Category>> {
  try {
    const validated = createCategorySchema.parse(input);

    const [category] = await db
      .insert(categories)
      .values(validated)
      .returning();

    if (!category) {
      return { success: false, error: "Failed to create category" };
    }

    return { success: true, data: category };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message ?? "Validation error" };
    }
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

// ============================================================================
// Get All Categories
// ============================================================================
export async function getCategories(): Promise<ActionResult<Category[]>> {
  try {
    const allCategories = await db.select().from(categories);
    return { success: true, data: allCategories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

// ============================================================================
// Get Category by ID
// ============================================================================
export async function getCategoryById(
  id: number
): Promise<ActionResult<Category>> {
  try {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

// ============================================================================
// Update Category
// ============================================================================
export async function updateCategory(
  id: number,
  input: Partial<NewCategory>
): Promise<ActionResult<Category>> {
  try {
    const validated = updateCategorySchema.parse(input);

    const [category] = await db
      .update(categories)
      .set(validated)
      .where(eq(categories.id, id))
      .returning();

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    return { success: true, data: category };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message ?? "Validation error" };
    }
    console.error("Error updating category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

// ============================================================================
// Delete Category
// ============================================================================
export async function deleteCategory(
  id: number
): Promise<ActionResult<{ id: number }>> {
  try {
    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });

    if (!deleted) {
      return { success: false, error: "Category not found" };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

