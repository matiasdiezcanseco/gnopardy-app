"use client";

import { useRouter } from "next/navigation";
import { CategoryColumn } from "./CategoryColumn";
import { cn } from "~/lib/utils";
import type { Category, Question } from "~/server/db/schema";

interface GameBoardProps {
  categories: Category[];
  questions: Question[];
  gameId: number;
  selectedPlayerId: number | null;
}

export function GameBoard({
  categories,
  questions,
  gameId,
  selectedPlayerId,
}: GameBoardProps) {
  const router = useRouter();

  // Group questions by category
  const questionsByCategory = categories.reduce(
    (acc, category) => {
      acc[category.id] = questions.filter((q) => q.categoryId === category.id);
      return acc;
    },
    {} as Record<number, Question[]>
  );

  const handleSelectQuestion = (questionId: number) => {
    if (selectedPlayerId === null) {
      return;
    }
    router.push(
      `/question/${questionId}?gameId=${gameId}&playerId=${selectedPlayerId}`
    );
  };

  const isPlayerSelected = selectedPlayerId !== null;

  return (
    <div className="w-full">
      {/* Player Selection Warning */}
      {!isPlayerSelected && (
        <div className="mb-4 rounded-lg bg-amber-500/20 border border-amber-500/50 px-4 py-3 text-center text-amber-200">
          <p className="text-sm font-medium">
            Please select a player before choosing a question
          </p>
        </div>
      )}

      {/* Game Board Grid */}
      <div
        className={cn(
          "grid gap-2 sm:gap-3 md:gap-4",
          // Responsive columns based on category count
          categories.length <= 4 && "grid-cols-2 sm:grid-cols-4",
          categories.length === 5 && "grid-cols-3 sm:grid-cols-5",
          categories.length >= 6 && "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"
        )}
      >
        {categories.map((category) => (
          <CategoryColumn
            key={category.id}
            category={category}
            questions={questionsByCategory[category.id] ?? []}
            isPlayerSelected={isPlayerSelected}
            onSelectQuestion={handleSelectQuestion}
          />
        ))}
      </div>
    </div>
  );
}

