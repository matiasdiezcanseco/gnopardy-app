"use client";

import { QuestionCell } from "./QuestionCell";
import { cn } from "~/lib/utils";
import type { Category, Question } from "~/server/db/schema";

interface CategoryColumnProps {
  category: Category;
  questions: Question[];
  isPlayerSelected: boolean;
  onSelectQuestion: (questionId: number) => void;
}

export function CategoryColumn({
  category,
  questions,
  isPlayerSelected,
  onSelectQuestion,
}: CategoryColumnProps) {
  // Sort questions by points (100, 200, 300, 400, 500)
  const sortedQuestions = [...questions].sort((a, b) => a.points - b.points);

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {/* Category Header */}
      <div
        className={cn(
          "rounded-lg px-2 py-3 text-center sm:px-4 sm:py-4",
          "bg-gradient-to-b from-blue-700 to-blue-900",
          "border-2 border-blue-400/30",
          "shadow-lg"
        )}
        style={{
          backgroundColor: category.color ?? undefined,
        }}
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-white sm:text-sm md:text-base lg:text-lg">
          {category.name}
        </h2>
      </div>

      {/* Question Cells */}
      <div className="flex flex-col gap-2 sm:gap-3">
        {sortedQuestions.map((question) => (
          <QuestionCell
            key={question.id}
            questionId={question.id}
            points={question.points}
            isAnswered={question.isAnswered}
            isDisabled={!isPlayerSelected}
            onClick={onSelectQuestion}
          />
        ))}
      </div>
    </div>
  );
}

