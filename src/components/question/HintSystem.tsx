"use client";

import { useState, useTransition } from "react";
import { Button } from "~/components/ui/button";
import { HintDisplay } from "./HintDisplay";
import { revealHint } from "~/server/actions/hint";
import type { QuestionHint } from "~/server/db/schema";

interface HintSystemProps {
  hints: QuestionHint[];
  revealedHintIds: number[];
  gameId: number;
  questionId: number;
  onHintRevealed?: (hintId: number) => void;
}

export function HintSystem({
  hints,
  revealedHintIds: initialRevealedIds,
  gameId,
  questionId,
  onHintRevealed,
}: HintSystemProps) {
  const [isPending, startTransition] = useTransition();
  const [revealedHintIds, setRevealedHintIds] =
    useState<number[]>(initialRevealedIds);
  const [error, setError] = useState<string | null>(null);

  if (hints.length === 0) {
    return null;
  }

  // Sort hints by order
  const sortedHints = [...hints].sort((a, b) => a.order - b.order);

  // Get revealed hints
  const revealedHints = sortedHints.filter((hint) =>
    revealedHintIds.includes(hint.id),
  );

  // Get next hint to reveal
  const nextHint = sortedHints.find(
    (hint) => !revealedHintIds.includes(hint.id),
  );

  const handleRevealHint = () => {
    if (!nextHint) return;

    setError(null);
    startTransition(async () => {
      const result = await revealHint(gameId, questionId, nextHint.id);

      if (result.success) {
        setRevealedHintIds((prev) => [...prev, nextHint.id]);
        onHintRevealed?.(nextHint.id);
      } else {
        setError(result.error || "Failed to reveal hint");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Revealed Hints */}
      {revealedHints.length > 0 && (
        <div className="space-y-3">
          {revealedHints.map((hint, index) => (
            <HintDisplay key={hint.id} hint={hint} hintNumber={index + 1} />
          ))}
        </div>
      )}

      {/* Reveal Next Hint Button */}
      {nextHint && (
        <div className="flex flex-col items-center gap-2">
          {error && (
            <div className="w-full rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Button
            onClick={handleRevealHint}
            disabled={isPending}
            variant="outline"
            className="border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 mr-2"
            >
              <path d="M12 .75a8.25 8.25 0 00-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 00.577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 01-.937-.171.75.75 0 11.374-1.453 5.261 5.261 0 002.626 0 .75.75 0 11.374 1.453 6.714 6.714 0 01-.937.17v4.662c0 .326.277.585.6.544.364-.047.722-.112 1.074-.195a.75.75 0 00.577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0012 .75z" />
              <path
                fillRule="evenodd"
                d="M9.013 19.9a.75.75 0 01.877-.597 11.319 11.319 0 004.22 0 .75.75 0 11.28 1.473 12.819 12.819 0 01-4.78 0 .75.75 0 01-.597-.876zM9.754 22.344a.75.75 0 01.824-.668 13.682 13.682 0 002.844 0 .75.75 0 11.156 1.492 15.156 15.156 0 01-3.156 0 .75.75 0 01-.668-.824z"
                clipRule="evenodd"
              />
            </svg>
            Reveal Hint {revealedHints.length + 1} of {hints.length}
          </Button>
        </div>
      )}

      {/* All Hints Revealed Message */}
      {!nextHint && revealedHints.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          All hints revealed ({revealedHints.length} of {hints.length})
        </div>
      )}
    </div>
  );
}

