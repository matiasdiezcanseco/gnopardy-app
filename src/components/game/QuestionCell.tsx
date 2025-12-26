"use client";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface QuestionCellProps {
  questionId: number;
  points: number;
  isAnswered: boolean;
  isDisabled?: boolean;
  onClick: (questionId: number) => void;
}

export function QuestionCell({
  questionId,
  points,
  isAnswered,
  isDisabled = false,
  onClick,
}: QuestionCellProps) {
  const handleClick = () => {
    if (!isAnswered && !isDisabled) {
      onClick(questionId);
    }
  };

  return (
    <Button
      variant="default"
      className={cn(
        "aspect-square w-full text-2xl font-bold sm:text-3xl md:text-4xl",
        "bg-gradient-to-b from-blue-600 to-blue-800",
        "hover:from-blue-500 hover:to-blue-700",
        "text-amber-400 shadow-lg",
        "transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-xl",
        "active:scale-[0.98]",
        "border-2 border-blue-400/30",
        isAnswered && [
          "opacity-30 cursor-not-allowed",
          "bg-gradient-to-b from-gray-600 to-gray-800",
          "text-gray-500",
          "hover:scale-100 hover:shadow-lg",
        ],
        isDisabled &&
          !isAnswered && [
            "opacity-60 cursor-not-allowed",
            "hover:scale-100",
          ]
      )}
      disabled={isAnswered || isDisabled}
      onClick={handleClick}
      aria-label={`$${points} question${isAnswered ? " (answered)" : ""}`}
    >
      {isAnswered ? "" : `$${points}`}
    </Button>
  );
}

