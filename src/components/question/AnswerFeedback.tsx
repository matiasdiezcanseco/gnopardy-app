"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface AnswerFeedbackProps {
  isCorrect: boolean;
  points: number;
  correctAnswer?: string;
  gameId: number;
  autoNavigateDelay?: number; // in seconds, 0 to disable
  className?: string;
}

export function AnswerFeedback({
  isCorrect,
  points,
  correctAnswer,
  gameId,
  autoNavigateDelay = 5,
  className,
}: AnswerFeedbackProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(autoNavigateDelay);

  useEffect(() => {
    if (autoNavigateDelay <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(`/game/${gameId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoNavigateDelay, gameId, router]);

  const handleContinue = () => {
    router.push(`/game/${gameId}`);
  };

  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-4 duration-500",
        "rounded-xl p-6 sm:p-8 text-center shadow-2xl",
        isCorrect
          ? "bg-gradient-to-b from-green-600 to-green-800 text-white"
          : "bg-gradient-to-b from-red-600 to-red-800 text-white",
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Icon */}
      <div className="mb-4 flex justify-center" aria-hidden="true">
        {isCorrect ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-20 w-20 text-green-200"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-20 w-20 text-red-200"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Title */}
      <h2 className="mb-2 text-3xl font-bold sm:text-4xl">
        {isCorrect ? "Correct!" : "Incorrect"}
      </h2>

      {/* Points */}
      <p className="mb-4 text-2xl font-semibold sm:text-3xl" aria-label={`${isCorrect ? "Gained" : "Lost"} ${points} points`}>
        {isCorrect ? "+" : "-"}${points}
      </p>

      {/* Correct Answer (if wrong) */}
      {!isCorrect && correctAnswer && (
        <div className="mb-6 rounded-lg bg-white/10 p-4">
          <p className="text-sm uppercase tracking-wider opacity-80">
            Correct Answer
          </p>
          <p className="mt-1 text-xl font-semibold" role="status">
            {correctAnswer}
          </p>
        </div>
      )}

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        size="lg"
        variant="secondary"
        className="w-full sm:w-auto"
        aria-label={`Continue to game board${autoNavigateDelay > 0 && countdown > 0 ? `, auto-navigating in ${countdown} seconds` : ""}`}
      >
        Continue to Game Board
        {autoNavigateDelay > 0 && countdown > 0 && (
          <span className="ml-2 text-muted-foreground" aria-hidden="true">
            ({countdown}s)
          </span>
        )}
      </Button>
    </div>
  );
}

