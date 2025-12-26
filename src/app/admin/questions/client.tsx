"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
  const [questions, setQuestions] =
    useState<QuestionWithAnswers[]>(initialQuestions);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

    // For text questions, get the correct answer from answers array
    const textAnswer = question.answers?.find((a) => a.isCorrect)?.text ?? "";
    setCorrectAnswer(textAnswer);

    setMultipleChoiceAnswers(
      question.answers?.map((a) => ({
        id: a.id,
        text: a.text,
        isCorrect: a.isCorrect,
        order: a.order ?? 0,
      })) ?? [],
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

    if (
      (type === "audio" || type === "video" || type === "image") &&
      !mediaUrl
    ) {
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
      };

      if (editingId !== null) {
        // Update existing question
        const result = await updateQuestion(editingId, questionData);

        if (!result.success) {
          setError(result.error);
          return;
        }

        // Handle answers based on question type
        if (type === "multiple_choice") {
          // Multiple choice: manage multiple answers
          const existingAnswerIds = multipleChoiceAnswers
            .filter((a) => a.id)
            .map((a) => a.id!);

          const question = questions.find((q) => q.id === editingId);
          const answersToDelete =
            question?.answers?.filter(
              (a) => !existingAnswerIds.includes(a.id),
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
        } else {
          // Text/media questions: single correct answer
          const question = questions.find((q) => q.id === editingId);
          const existingAnswer = question?.answers?.find((a) => a.isCorrect);

          if (existingAnswer) {
            // Update existing answer
            await updateAnswer(existingAnswer.id, {
              text: correctAnswer,
              isCorrect: true,
            });
          } else {
            // Create new answer
            await createAnswer({
              questionId: editingId,
              text: correctAnswer,
              isCorrect: true,
            });
          }
        }

        // Refresh question list - Just update with the returned data, answers will be reloaded
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === editingId ? { ...result.data, answers: q.answers } : q,
          ),
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

        // Create answers based on question type
        if (type === "multiple_choice") {
          // Create multiple choice answers
          for (const answer of multipleChoiceAnswers) {
            await createAnswer({
              questionId: newQuestion.id,
              text: answer.text,
              isCorrect: answer.isCorrect,
              order: answer.order,
            });
          }
        } else {
          // Create single correct answer for text/media questions
          await createAnswer({
            questionId: newQuestion.id,
            text: correctAnswer,
            isCorrect: true,
          });
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

  // Apply category filter and search
  let filteredQuestions = questions;

  if (filterCategory) {
    filteredQuestions = filteredQuestions.filter(
      (q) => q.categoryId === filterCategory,
    );
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredQuestions = filteredQuestions.filter(
      (q) =>
        q.text.toLowerCase().includes(query) ||
        q.answers?.some((a) => a.text.toLowerCase().includes(query)) ||
        categories
          .find((c) => c.id === q.categoryId)
          ?.name.toLowerCase()
          .includes(query),
    );
  }

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
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="truncate text-sm">{mediaUrl}</span>
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
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="multiple_choice">
                      Multiple Choice
                    </SelectItem>
                  </SelectContent>
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select points" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="300">300</SelectItem>
                    <SelectItem value="400">400</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type-specific fields */}
              {renderTypeSpecificFields()}

              {/* Correct Answer (for non-multiple-choice) */}
              {type !== "multiple_choice" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Correct Answer *
                  </label>
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

      {/* Filter and Search */}
      {!isCreating && editingId === null && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              {/* Search */}
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search questions, answers, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">
                  Category:
                </label>
                <Select
                  value={filterCategory?.toString() ?? "all"}
                  onValueChange={(value) =>
                    setFilterCategory(value === "all" ? null : parseInt(value))
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || filterCategory) && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Active filters:
                </span>
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  >
                    Search: "{searchQuery}" ✕
                  </Badge>
                )}
                {filterCategory && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setFilterCategory(null)}
                  >
                    Category:{" "}
                    {categories.find((c) => c.id === filterCategory)?.name} ✕
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterCategory(null);
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
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
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{question.type}</Badge>
                          <Badge>{question.points} pts</Badge>
                          {category && (
                            <Badge
                              style={{
                                backgroundColor: category.color ?? undefined,
                              }}
                            >
                              {category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {question.type !== "multiple_choice" &&
                      question.answers &&
                      question.answers.length > 0 && (
                        <p className="text-muted-foreground text-sm">
                          Answer:{" "}
                          {question.answers.find((a) => a.isCorrect)?.text}
                        </p>
                      )}
                    {question.mediaUrl && (
                      <p className="text-muted-foreground truncate text-sm">
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
        <div className="py-12 text-center">
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
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
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
