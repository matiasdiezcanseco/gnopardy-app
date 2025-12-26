"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select } from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
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
import { MediaUpload } from "~/components/admin/MediaUpload";
import { MultipleChoiceManager } from "~/components/admin/MultipleChoiceManager";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "~/server/actions/question";
import {
  createAnswer,
  updateAnswer,
  deleteAnswer,
} from "~/server/actions/answer";
import type { Question, Category, Answer } from "~/server/db/schema";

interface QuestionWithAnswers extends Question {
  answers?: Answer[];
  category?: { id: number; name: string } | null;
}

interface AdminQuestionsClientProps {
  initialQuestions: QuestionWithAnswers[];
  categories: Category[];
}

type QuestionType = "text" | "audio" | "video" | "image" | "multiple_choice";

export function AdminQuestionsClient({
  initialQuestions,
  categories,
}: AdminQuestionsClientProps) {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>(initialQuestions);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);

  // Form state
  const [text, setText] = useState("");
  const [type, setType] = useState<QuestionType>("text");
  const [points, setPoints] = useState(100);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<
    Array<{ id?: number; text: string; isCorrect: boolean; order: number }>
  >([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setText("");
    setType("text");
    setPoints(100);
    setCategoryId(categories[0]?.id ?? null);
    setMediaUrl("");
    setCorrectAnswer("");
    setMultipleChoiceAnswers([]);
    setEditingId(null);
    setIsCreating(false);
    setError(null);
  };

  const startEdit = (question: QuestionWithAnswers) => {
    setText(question.text);
    setType(question.type as QuestionType);
    setPoints(question.points);
    setCategoryId(question.categoryId);
    setMediaUrl(question.mediaUrl ?? "");
    setCorrectAnswer(question.correctAnswer ?? "");
    setMultipleChoiceAnswers(
      question.answers?.map((a) => ({
        id: a.id,
        text: a.text,
        isCorrect: a.isCorrect,
        order: a.order ?? 0,
      })) ?? []
    );
    setEditingId(question.id);
    setIsCreating(false);
    setError(null);
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
    setCategoryId(categories[0]?.id ?? null);
  };

  const validateForm = (): boolean => {
    if (!text.trim()) {
      setError("Question text is required");
      return false;
    }

    if (!categoryId) {
      setError("Please select a category");
      return false;
    }

    if (type === "multiple_choice") {
      if (multipleChoiceAnswers.length < 2) {
        setError("Multiple choice questions need at least 2 answer options");
        return false;
      }
      if (!multipleChoiceAnswers.some((a) => a.isCorrect)) {
        setError("Mark at least one answer as correct");
        return false;
      }
    } else if (!correctAnswer.trim()) {
      setError("Correct answer is required");
      return false;
    }

    if ((type === "audio" || type === "video" || type === "image") && !mediaUrl) {
      setError(`Please upload a ${type} file`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const questionData = {
        text,
        type,
        points,
        categoryId: categoryId!,
        mediaUrl: mediaUrl || null,
        correctAnswer: type !== "multiple_choice" ? correctAnswer : null,
      };

      if (editingId !== null) {
        // Update existing question
        const result = await updateQuestion(editingId, questionData);

        if (!result.success) {
          setError(result.error);
          return;
        }

        // Handle multiple choice answers
        if (type === "multiple_choice") {
          // Delete answers not in the new list
          const existingAnswerIds = multipleChoiceAnswers
            .filter((a) => a.id)
            .map((a) => a.id!);
          
          const question = questions.find((q) => q.id === editingId);
          const answersToDelete = question?.answers?.filter(
            (a) => !existingAnswerIds.includes(a.id)
          ) ?? [];

          for (const answer of answersToDelete) {
            await deleteAnswer(answer.id);
          }

          // Update or create answers
          for (const answer of multipleChoiceAnswers) {
            if (answer.id) {
              await updateAnswer(answer.id, {
                text: answer.text,
                isCorrect: answer.isCorrect,
                order: answer.order,
              });
            } else {
              await createAnswer({
                questionId: editingId,
                text: answer.text,
                isCorrect: answer.isCorrect,
                order: answer.order,
              });
            }
          }
        }

        // Refresh question list
        const updatedQuestion = { ...result.data, answers: multipleChoiceAnswers };
        setQuestions((prev) =>
          prev.map((q) => (q.id === editingId ? updatedQuestion : q))
        );
        resetForm();
      } else {
        // Create new question
        const result = await createQuestion(questionData);

        if (!result.success) {
          setError(result.error);
          return;
        }

        const newQuestion = result.data;

        // Create multiple choice answers
        if (type === "multiple_choice") {
          for (const answer of multipleChoiceAnswers) {
            await createAnswer({
              questionId: newQuestion.id,
              text: answer.text,
              isCorrect: answer.isCorrect,
              order: answer.order,
            });
          }
        }

        setQuestions((prev) => [...prev, newQuestion]);
        resetForm();
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
      const result = await deleteQuestion(deleteId);

      if (result.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== deleteId));
        setDeleteId(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to delete question");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuestions = filterCategory
    ? questions.filter((q) => q.categoryId === filterCategory)
    : questions;

  const renderTypeSpecificFields = () => {
    if (type === "multiple_choice") {
      return (
        <MultipleChoiceManager
          value={multipleChoiceAnswers}
          onChange={setMultipleChoiceAnswers}
        />
      );
    }

    if (type === "audio" || type === "video" || type === "image") {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium">Media File *</label>
          {mediaUrl ? (
            <div className="space-y-2">
              <div className="rounded-lg border p-3 flex items-center justify-between">
                <span className="text-sm truncate">{mediaUrl}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMediaUrl("")}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <MediaUpload
              onUpload={setMediaUrl}
              accept={
                type === "audio"
                  ? "audio/*"
                  : type === "video"
                  ? "video/*"
                  : "image/*"
              }
            />
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {editingId !== null
                ? "Edit Question"
                : isCreating
                ? "Create New Question"
                : "Questions"}
            </CardTitle>
            {!isCreating && editingId === null && (
              <Button onClick={startCreate}>+ Create Question</Button>
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

              {/* Question Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Question Type *</label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as QuestionType)}
                  disabled={isSubmitting}
                >
                  <option value="text">Text</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                  <option value="multiple_choice">Multiple Choice</option>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={categoryId?.toString() ?? ""}
                  onValueChange={(value) => setCategoryId(parseInt(value))}
                  disabled={isSubmitting}
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Question Text *</label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the question..."
                  rows={3}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Points */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Points *</label>
                <Select
                  value={points.toString()}
                  onValueChange={(value) => setPoints(parseInt(value))}
                  disabled={isSubmitting}
                >
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                </Select>
              </div>

              {/* Type-specific fields */}
              {renderTypeSpecificFields()}

              {/* Correct Answer (for non-multiple-choice) */}
              {type !== "multiple_choice" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Correct Answer *</label>
                  <Input
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    placeholder="Enter the correct answer..."
                    required
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingId !== null
                  ? "Update Question"
                  : "Create Question"}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Filter */}
      {!isCreating && editingId === null && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium whitespace-nowrap">
                Filter by category:
              </label>
              <Select
                value={filterCategory?.toString() ?? ""}
                onValueChange={(value) =>
                  setFilterCategory(value ? parseInt(value) : null)
                }
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((question) => {
          const category = categories.find((c) => c.id === question.categoryId);
          
          return (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{question.text}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">{question.type}</Badge>
                          <Badge>{question.points} pts</Badge>
                          {category && (
                            <Badge
                              style={{ backgroundColor: category.color ?? undefined }}
                            >
                              {category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {question.correctAnswer && (
                      <p className="text-sm text-muted-foreground">
                        Answer: {question.correctAnswer}
                      </p>
                    )}
                    {question.mediaUrl && (
                      <p className="text-sm text-muted-foreground truncate">
                        Media: {question.mediaUrl}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(question)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(question.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredQuestions.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No questions yet</p>
          <Button onClick={startCreate}>Create Your First Question</Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question and its answers. This
              action cannot be undone.
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

