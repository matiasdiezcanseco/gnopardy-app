"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { Answer } from "~/server/db/schema";

interface MultipleChoiceProps {
  answers: Answer[];
  onSubmit: (answerId: number) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MultipleChoice({
  answers,
  onSubmit,
  isSubmitting = false,
  disabled = false,
  className,
}: MultipleChoiceProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Sort answers by order field
  const sortedAnswers = [...answers].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const handleSubmit = () => {
    if (selectedId === null) return;
    onSubmit(selectedId);
  };

  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Answer Options */}
      <div className="space-y-3">
        {sortedAnswers.map((answer, index) => {
          const isSelected = selectedId === answer.id;
          const letter = optionLetters[index] ?? String(index + 1);

          return (
            <button
              key={answer.id}
              onClick={() => !disabled && !isSubmitting && setSelectedId(answer.id)}
              disabled={disabled || isSubmitting}
              className={cn(
                "w-full flex items-center gap-4 rounded-lg p-4",
                "text-left transition-all duration-200",
                "border-2",
                isSelected
                  ? [
                      "bg-primary/10 border-primary",
                      "shadow-lg shadow-primary/20",
                    ]
                  : [
                      "bg-card border-border",
                      "hover:bg-accent hover:border-accent",
                    ],
                (disabled || isSubmitting) && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Option Letter */}
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  "text-lg font-bold",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {letter}
              </div>

              {/* Answer Text */}
              <span className="text-lg">{answer.text}</span>
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        size="lg"
        className="w-full"
        disabled={isSubmitting || disabled || selectedId === null}
      >
        {isSubmitting ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Checking...
          </>
        ) : (
          "Submit Answer"
        )}
      </Button>
    </div>
  );
}

