"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "~/server/actions/category";
import type { Category } from "~/server/db/schema";

interface AdminCategoriesClientProps {
  initialCategories: Category[];
}

export function AdminCategoriesClient({
  initialCategories,
}: AdminCategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#1e40af");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("#1e40af");
    setEditingId(null);
    setIsCreating(false);
    setError(null);
  };

  const startEdit = (category: Category) => {
    setName(category.name);
    setDescription(category.description ?? "");
    setColor(category.color ?? "#1e40af");
    setEditingId(category.id);
    setIsCreating(false);
    setError(null);
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (editingId !== null) {
        // Update existing category
        const result = await updateCategory(editingId, {
          name,
          description: description || null,
          color,
        });

        if (result.success) {
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === editingId ? result.data : cat
            )
          );
          resetForm();
        } else {
          setError(result.error);
        }
      } else {
        // Create new category
        const result = await createCategory({
          name,
          description: description || null,
          color,
        });

        if (result.success) {
          setCategories((prev) => [...prev, result.data]);
          resetForm();
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;

    setIsSubmitting(true);
    try {
      const result = await deleteCategory(deleteId);

      if (result.success) {
        setCategories((prev) => prev.filter((cat) => cat.id !== deleteId));
        setDeleteId(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to delete category");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {editingId !== null
                ? "Edit Category"
                : isCreating
                ? "Create New Category"
                : "Categories"}
            </CardTitle>
            {!isCreating && editingId === null && (
              <Button onClick={startCreate}>+ Create Category</Button>
            )}
            {(isCreating || editingId !== null) && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        {(isCreating || editingId !== null) && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category name"
                  required
                  maxLength={256}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-20 h-10"
                    disabled={isSubmitting}
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#1e40af"
                    className="flex-1"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting || !name.trim()}>
                {isSubmitting
                  ? "Saving..."
                  : editingId !== null
                  ? "Update Category"
                  : "Create Category"}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Categories List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader
              className="pb-3"
              style={{
                backgroundColor: category.color ?? undefined,
              }}
            >
              <CardTitle className="text-white">{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {category.description && (
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(category)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(category.id)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No categories yet</p>
          <Button onClick={startCreate}>Create Your First Category</Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category. Questions in this
              category will also be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

