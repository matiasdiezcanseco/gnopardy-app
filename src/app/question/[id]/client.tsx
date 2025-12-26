"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { QuestionView } from "~/components/question/QuestionView";
import { TextAnswerInput } from "~/components/question/TextAnswerInput";
import { MultipleChoice } from "~/components/question/MultipleChoice";
import { AnswerFeedback } from "~/components/question/AnswerFeedback";
import { Button } from "~/components/ui/button";
import {
  validateTextAnswer,
  validateMultipleChoiceAnswer,
} from "~/server/actions/answer";
import { markQuestionAsAnswered } from "~/server/actions/question";
import { updatePlayerScore } from "~/server/actions/player";
import type { Question, Answer, Player } from "~/server/db/schema";

interface QuestionWithCategory extends Question {
  category: { id: number; name: string } | null;
}

interface QuestionPageClientProps {
  question: QuestionWithCategory;
  answers: Answer[];
  player: Player;
  gameId: number;
}

interface AnswerResult {
  isCorrect: boolean;
  correctAnswer?: string;
  points: number;
}

export function QuestionPageClient({
  question,
  answers,
  player,
  gameId,
}: QuestionPageClientProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTextSubmit = (answer: string) => {
    setError(null);
    startTransition(async () => {
      try {
        const validationResult = await validateTextAnswer(question.id, answer);

        if (!validationResult.success) {
          setError(validationResult.error);
          return;
        }

        const { isCorrect, correctAnswer, points } = validationResult.data;

        // Update player score
        const pointsDelta = isCorrect ? points : -points;
        const scoreResult = await updatePlayerScore(player.id, pointsDelta);

        if (!scoreResult.success) {
          setError("Failed to update score. Please try again.");
          return;
        }

        // Mark question as answered
        const markResult = await markQuestionAsAnswered(question.id);

        if (!markResult.success) {
          setError("Failed to mark question as answered.");
          return;
        }

        // Show result
        setResult({ isCorrect, correctAnswer, points });
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        console.error("Error submitting answer:", err);
      }
    });
  };

  const handleMultipleChoiceSubmit = (answerId: number) => {
    setError(null);
    startTransition(async () => {
      try {
        const validationResult = await validateMultipleChoiceAnswer(
          question.id,
          answerId
        );

        if (!validationResult.success) {
          setError(validationResult.error);
          return;
        }

        const { isCorrect, correctAnswer, points } = validationResult.data;

        // Update player score
        const pointsDelta = isCorrect ? points : -points;
        const scoreResult = await updatePlayerScore(player.id, pointsDelta);

        if (!scoreResult.success) {
          setError("Failed to update score. Please try again.");
          return;
        }

        // Mark question as answered
        const markResult = await markQuestionAsAnswered(question.id);

        if (!markResult.success) {
          setError("Failed to mark question as answered.");
          return;
        }

        // Show result
        setResult({ isCorrect, correctAnswer, points });
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        console.error("Error submitting answer:", err);
      }
    });
  };

  const renderAnswerInput = () => {
    if (question.type === "multiple_choice") {
      return (
        <MultipleChoice
          answers={answers}
          onSubmit={handleMultipleChoiceSubmit}
          isSubmitting={isPending}
        />
      );
    }

    // Default to text input for text, audio, video, image types
    return (
      <TextAnswerInput
        onSubmit={handleTextSubmit}
        isSubmitting={isPending}
        placeholder="What is..."
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link
            href={`/game/${gameId}`}
            className="flex items-center gap-2 text-white hover:text-amber-400 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
                clipRule="evenodd"
              />
            </svg>
            Back to Game
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Playing as:</span>
            <span className="font-semibold text-amber-400">{player.name}</span>
            <span className="text-sm text-muted-foreground">
              (${player.score.toLocaleString()})
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="mx-auto max-w-2xl lg:max-w-3xl">
          {result ? (
            /* Answer Feedback */
            <AnswerFeedback
              isCorrect={result.isCorrect}
              points={result.points}
              correctAnswer={result.correctAnswer}
              gameId={gameId}
            />
          ) : (
            /* Question and Answer Input */
            <div className="space-y-6 sm:space-y-8">
              <QuestionView question={question} category={question.category} />

              <div className="rounded-lg sm:rounded-xl border border-white/10 bg-black/20 p-4 sm:p-6 backdrop-blur">
                <h3 className="mb-4 text-base sm:text-lg font-semibold text-white">
                  Your Answer
                </h3>
                {error && (
                  <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {renderAnswerInput()}
              </div>

              {/* Skip Button */}
              <div className="text-center">
                <Link href={`/game/${gameId}`}>
                  <Button variant="ghost" className="text-muted-foreground" size="sm">
                    Skip Question
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

