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
          "flex min-h-[4rem] w-full items-center justify-center rounded-xl border-4 border-secondary/50 px-2 py-3 text-center shadow-lg sm:min-h-[5rem] sm:px-3 sm:py-4",
          "bg-primary text-primary-foreground",
        )}
        style={{
          backgroundColor: category.color ?? undefined,
        }}
      >
        <h2 className="text-base font-black uppercase tracking-widest text-white drop-shadow-md sm:text-lg md:text-xl lg:text-2xl">
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

