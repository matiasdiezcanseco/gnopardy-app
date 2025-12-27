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
        "aspect-[16/10] h-auto w-full p-2 sm:p-4",
        "flex flex-col items-center justify-center",
        "text-2xl font-black tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl",
        "bg-primary text-primary-foreground shadow-lg",
        "hover:bg-primary/90 hover:z-10 hover:scale-[1.02] hover:shadow-xl",
        "active:scale-[0.98]",
        "border-secondary/50 border-4", // Thicker border
        "transition-all duration-200",
        "rounded-xl",
        "focus:ring-ring/50 focus:ring-4 focus:ring-offset-2 focus:outline-none",
        isAnswered && [
          "cursor-not-allowed opacity-40",
          "bg-muted text-muted-foreground",
          "border-muted-foreground/20",
          "hover:bg-muted hover:scale-100 hover:shadow-none",
        ],
        isDisabled &&
          !isAnswered && ["cursor-not-allowed opacity-60", "hover:scale-100"],
      )}
      disabled={isAnswered || isDisabled}
      onClick={handleClick}
      aria-label={`${points} dollar question${isAnswered ? ", already answered" : ", click to answer"}`}
      aria-disabled={isAnswered || isDisabled}
      role="button"
      tabIndex={isAnswered || isDisabled ? -1 : 0}
    >
      {isAnswered ? "" : `$${points}`}
    </Button>
  );
}
