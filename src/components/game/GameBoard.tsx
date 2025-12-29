"use client";

import { useRouter } from "next/navigation";
import { CategoryColumn } from "./CategoryColumn";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { Category, Question } from "~/server/db/schema";

interface GameBoardProps {
  categories: Category[];
  questions: Question[];
  gameId: number;
  selectedPlayerId: number | null;
  hasFinalJeopardy?: boolean;
}

export function GameBoard({
  categories,
  questions,
  gameId,
  selectedPlayerId,
  hasFinalJeopardy = false,
}: GameBoardProps) {
  const router = useRouter();

  // Filter out Final Jeopardy category from regular board
  const regularCategories = categories.filter((c) => !c.isFinalJeopardy);
  const finalJeopardyCategory = categories.find((c) => c.isFinalJeopardy);

  // Group questions by category (excluding Final Jeopardy)
  const questionsByCategory = regularCategories.reduce(
    (acc, category) => {
      acc[category.id] = questions.filter((q) => q.categoryId === category.id);
      return acc;
    },
    {} as Record<number, Question[]>,
  );

  // Check if all regular questions are answered
  const allRegularQuestionsAnswered = questions
    .filter((q) => {
      const category = categories.find((c) => c.id === q.categoryId);
      return category && !category.isFinalJeopardy;
    })
    .every((q) => q.isAnswered);

  const handleSelectQuestion = (questionId: number) => {
    if (selectedPlayerId === null) {
      return;
    }
    router.push(
      `/question/${questionId}?gameId=${gameId}&playerId=${selectedPlayerId}`,
    );
  };

  const handleFinalJeopardy = () => {
    if (!finalJeopardyCategory) return;

    // Get the Final Jeopardy question ID
    const finalQuestion = questions.find(
      (q) => q.categoryId === finalJeopardyCategory.id,
    );

    if (finalQuestion) {
      router.push(`/final-jeopardy/${finalQuestion.id}?gameId=${gameId}`);
    }
  };

  const isPlayerSelected = selectedPlayerId !== null;

  return (
    <div className="w-full space-y-6">
      {/* Player Selection Warning */}
      {!isPlayerSelected && (
        <div
          className="bg-primary/10 border-primary/20 text-primary mb-4 rounded-lg border px-4 py-3 text-center font-medium"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm">
            Please select a player before choosing a question
          </p>
        </div>
      )}

      {/* Game Board Grid */}
      <div
        className={cn(
          "grid gap-2 sm:gap-3 md:gap-4",
          // Responsive columns based on category count
          regularCategories.length <= 4 && "grid-cols-2 sm:grid-cols-4",
          regularCategories.length === 5 && "grid-cols-3 sm:grid-cols-5",
          regularCategories.length >= 6 &&
            "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
        )}
        role="grid"
        aria-label="Jeopardy game board"
        aria-describedby={!isPlayerSelected ? "player-warning" : undefined}
      >
        {regularCategories.map((category) => (
          <CategoryColumn
            key={category.id}
            category={category}
            questions={questionsByCategory[category.id] ?? []}
            isPlayerSelected={isPlayerSelected}
            onSelectQuestion={handleSelectQuestion}
          />
        ))}
      </div>

      {/* Final Jeopardy Section */}
      {hasFinalJeopardy &&
        finalJeopardyCategory &&
        allRegularQuestionsAnswered && (
          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="border-primary/50 from-primary/10 to-primary/5 rounded-xl border-2 bg-gradient-to-br p-8 text-center shadow-lg">
                <h2 className="text-primary mb-4 text-3xl font-bold">
                  Final Gnopardy!
                </h2>
                <p className="text-muted-foreground mb-6 text-lg">
                  All questions have been answered. Ready for the final round?
                </p>
                <p className="text-foreground mb-6 text-xl font-semibold">
                  Category: {finalJeopardyCategory.name}
                </p>
                <Button
                  size="lg"
                  onClick={handleFinalJeopardy}
                  className="px-8 py-6 text-lg font-bold"
                >
                  Enter Final Jeopardy →
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
