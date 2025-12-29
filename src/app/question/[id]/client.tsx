"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { QuestionView } from "~/components/question/QuestionView";
import { TextAnswerInput } from "~/components/question/TextAnswerInput";
import { MultipleChoice } from "~/components/question/MultipleChoice";
import { AnswerFeedback } from "~/components/question/AnswerFeedback";
import { PlayerSelector } from "~/components/player/PlayerSelector";
import { HintSystem } from "~/components/question/HintSystem";
import { Button } from "~/components/ui/button";
import {
  validateTextAnswer,
  validateMultipleChoiceAnswer,
  manualAnswerOverride,
} from "~/server/actions/answer";
import { markQuestionAsAnsweredInGame } from "~/server/actions/game";
import { updatePlayerScore, getPlayerById } from "~/server/actions/player";
import {
  recordAnswerHistory,
  hasPlayerAttemptedQuestion,
} from "~/server/actions/history";
import type {
  Question,
  Answer,
  Player,
  QuestionHint,
} from "~/server/db/schema";

interface QuestionWithCategory extends Question {
  category: { id: number; name: string } | null;
}

interface QuestionPageClientProps {
  question: QuestionWithCategory;
  answers: Answer[];
  player: Player;
  allPlayers: Player[];
  gameId: number;
  hints: QuestionHint[];
  revealedHintIds: number[];
}

interface AnswerResult {
  isCorrect: boolean;
  correctAnswer?: string;
  points: number;
}

export function QuestionPageClient({
  question,
  answers,
  player: initialPlayer,
  allPlayers: initialAllPlayers,
  gameId,
  hints,
  revealedHintIds: initialRevealedHintIds,
}: QuestionPageClientProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(initialPlayer);
  const [allPlayers, setAllPlayers] = useState<Player[]>(initialAllPlayers);
  const [revealedHintIds, setRevealedHintIds] = useState<number[]>(
    initialRevealedHintIds,
  );

  const handlePlayerSwitch = async (newPlayerId: number) => {
    // Reset result and error when switching players
    setResult(null);
    setError(null);

    // Fetch the new player's data
    startTransition(async () => {
      const playerResult = await getPlayerById(newPlayerId);
      if (playerResult.success) {
        setCurrentPlayer(playerResult.data);
      } else {
        setError("Failed to load player data");
      }
    });
  };

  const handleHintRevealed = (hintId: number) => {
    setRevealedHintIds((prev) => [...prev, hintId]);
  };

  const handleTextSubmit = (answer: string) => {
    setError(null);
    startTransition(async () => {
      try {
        // Check if player has already attempted this question
        const attemptCheck = await hasPlayerAttemptedQuestion(
          gameId,
          currentPlayer.id,
          question.id,
        );

        if (!attemptCheck.success) {
          setError("Failed to check attempt status. Please try again.");
          return;
        }

        if (attemptCheck.data) {
          setError(
            "You have already attempted this question. Let another player try!",
          );
          return;
        }

        const validationResult = await validateTextAnswer(question.id, answer);

        if (!validationResult.success) {
          setError(validationResult.error);
          return;
        }

        const { isCorrect, correctAnswer, points } = validationResult.data;

        // Update player score
        const pointsDelta = isCorrect ? points : -points;
        const scoreResult = await updatePlayerScore(
          currentPlayer.id,
          pointsDelta,
        );

        if (!scoreResult.success) {
          setError("Failed to update score. Please try again.");
          return;
        }

        // Update current player's score in state
        setCurrentPlayer((prev) => ({
          ...prev,
          score: prev.score + pointsDelta,
        }));
        setAllPlayers((prev) =>
          prev.map((p) =>
            p.id === currentPlayer.id
              ? { ...p, score: p.score + pointsDelta }
              : p,
          ),
        );

        // Record answer in history
        const historyResult = await recordAnswerHistory({
          gameId,
          playerId: currentPlayer.id,
          questionId: question.id,
          isCorrect,
          pointsEarned: pointsDelta,
          submittedAnswer: answer,
        });

        if (!historyResult.success) {
          console.error(
            "Failed to record answer history:",
            historyResult.error,
          );
        }

        // Only mark question as answered if the answer is correct
        if (isCorrect) {
          const markResult = await markQuestionAsAnsweredInGame(
            gameId,
            question.id,
          );

          if (!markResult.success) {
            setError("Failed to mark question as answered.");
            return;
          }
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
        // Check if player has already attempted this question
        const attemptCheck = await hasPlayerAttemptedQuestion(
          gameId,
          currentPlayer.id,
          question.id,
        );

        if (!attemptCheck.success) {
          setError("Failed to check attempt status. Please try again.");
          return;
        }

        if (attemptCheck.data) {
          setError(
            "You have already attempted this question. Let another player try!",
          );
          return;
        }

        const validationResult = await validateMultipleChoiceAnswer(
          question.id,
          answerId,
        );

        if (!validationResult.success) {
          setError(validationResult.error);
          return;
        }

        const { isCorrect, correctAnswer, points } = validationResult.data;

        // Update player score
        const pointsDelta = isCorrect ? points : -points;
        const scoreResult = await updatePlayerScore(
          currentPlayer.id,
          pointsDelta,
        );

        if (!scoreResult.success) {
          setError("Failed to update score. Please try again.");
          return;
        }

        // Update current player's score in state
        setCurrentPlayer((prev) => ({
          ...prev,
          score: prev.score + pointsDelta,
        }));
        setAllPlayers((prev) =>
          prev.map((p) =>
            p.id === currentPlayer.id
              ? { ...p, score: p.score + pointsDelta }
              : p,
          ),
        );

        // Record answer in history
        const historyResult = await recordAnswerHistory({
          gameId,
          playerId: currentPlayer.id,
          questionId: question.id,
          isCorrect,
          pointsEarned: pointsDelta,
          submittedAnswer: `Answer ID: ${answerId}`,
        });

        if (!historyResult.success) {
          console.error(
            "Failed to record answer history:",
            historyResult.error,
          );
        }

        // Only mark question as answered if the answer is correct
        if (isCorrect) {
          const markResult = await markQuestionAsAnsweredInGame(
            gameId,
            question.id,
          );

          if (!markResult.success) {
            setError("Failed to mark question as answered.");
            return;
          }
        }

        // Show result
        setResult({ isCorrect, correctAnswer, points });
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        console.error("Error submitting answer:", err);
      }
    });
  };

  const handleManualOverride = (forceCorrect: boolean) => {
    setError(null);
    startTransition(async () => {
      try {
        // Manual override bypasses the attempt check - host can force correct/incorrect
        // even if the player has already attempted the question
        const validationResult = await manualAnswerOverride(
          question.id,
          forceCorrect,
        );

        if (!validationResult.success) {
          setError(validationResult.error);
          return;
        }

        const { isCorrect, correctAnswer, points } = validationResult.data;

        // Update player score
        const pointsDelta = isCorrect ? points : -points;
        const scoreResult = await updatePlayerScore(
          currentPlayer.id,
          pointsDelta,
        );

        if (!scoreResult.success) {
          setError("Failed to update score. Please try again.");
          return;
        }

        // Update current player's score in state
        setCurrentPlayer((prev) => ({
          ...prev,
          score: prev.score + pointsDelta,
        }));
        setAllPlayers((prev) =>
          prev.map((p) =>
            p.id === currentPlayer.id
              ? { ...p, score: p.score + pointsDelta }
              : p,
          ),
        );

        // Record answer in history
        const historyResult = await recordAnswerHistory({
          gameId,
          playerId: currentPlayer.id,
          questionId: question.id,
          isCorrect,
          pointsEarned: pointsDelta,
          submittedAnswer: "Manual Override",
        });

        if (!historyResult.success) {
          console.error(
            "Failed to record answer history:",
            historyResult.error,
          );
        }

        // Only mark question as answered if the answer is correct
        if (isCorrect) {
          const markResult = await markQuestionAsAnsweredInGame(
            gameId,
            question.id,
          );

          if (!markResult.success) {
            setError("Failed to mark question as answered.");
            return;
          }
        }

        // Show result
        setResult({ isCorrect, correctAnswer, points });
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        console.error("Error processing manual override:", err);
      }
    });
  };

  const renderAnswerInput = () => {
    const hasMultipleChoiceAnswers =
      answers.length > 1 || question.type === "multiple_choice";

    if (hasMultipleChoiceAnswers) {
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
    <div className="bg-background text-foreground min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="bg-card/50 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href={`/game/${gameId}`}
            className="text-primary hover:text-primary/80 flex items-center gap-2 font-medium transition-colors"
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
          <div className="bg-secondary/10 border-secondary/20 flex items-center gap-3 rounded-full border px-4 py-2">
            <span className="text-muted-foreground text-sm">Playing as:</span>
            <span className="text-primary font-bold">{currentPlayer.name}</span>
            <span className="text-foreground text-sm font-medium">
              (${currentPlayer.score.toLocaleString()})
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-2xl lg:max-w-3xl">
          {result ? (
            /* Answer Feedback and Player Selection */
            <div className="space-y-6">
              <AnswerFeedback
                isCorrect={result.isCorrect}
                points={result.points}
                correctAnswer={result.correctAnswer}
                gameId={gameId}
                autoNavigateDelay={result.isCorrect ? 5 : 0} // Only auto-navigate if correct
              />

              {/* Show player selector if answer was incorrect */}
              {!result.isCorrect && (
                <div className="bg-card space-y-4 rounded-xl border p-6 shadow-md">
                  <div className="text-center">
                    <h3 className="text-foreground mb-2 text-xl font-bold">
                      Question Still Available
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Select another player to attempt this question
                    </p>
                  </div>

                  <PlayerSelector
                    players={allPlayers.filter(
                      (p) => p.id !== currentPlayer.id,
                    )}
                    selectedPlayerId={null}
                    onSelectPlayer={handlePlayerSwitch}
                  />

                  <div className="flex justify-center border-t pt-4">
                    <Link href={`/game/${gameId}`}>
                      <Button variant="outline">Return to Game Board</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Question and Answer Input */
            <div className="space-y-8">
              <QuestionView question={question} category={question.category} />

              {/* Hint System */}
              <HintSystem
                hints={hints}
                revealedHintIds={revealedHintIds}
                gameId={gameId}
                questionId={question.id}
                onHintRevealed={handleHintRevealed}
              />

              <div className="bg-card rounded-xl border p-8 shadow-md">
                <h3 className="text-foreground mb-6 text-lg font-bold">
                  Your Answer
                </h3>
                {error && (
                  <div className="bg-destructive/10 border-destructive/20 text-destructive mb-6 rounded-lg border p-4 text-sm font-medium">
                    {error}
                  </div>
                )}
                {renderAnswerInput()}
              </div>

              {/* Manual Override Section */}
              <div className="border-muted-foreground/30 bg-card/50 rounded-xl border border-dashed p-6 shadow-sm">
                <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
                  Host Controls
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Manually award or deny points if the answer is close but not
                  exact:
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleManualOverride(true)}
                    disabled={isPending}
                    className="flex-1 bg-green-600 font-semibold text-white hover:bg-green-700"
                    size="lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="mr-2 h-5 w-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Force Correct
                  </Button>
                  <Button
                    onClick={() => handleManualOverride(false)}
                    disabled={isPending}
                    className="flex-1 bg-red-600 font-semibold text-white hover:bg-red-700"
                    size="lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="mr-2 h-5 w-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Force Incorrect
                  </Button>
                </div>
              </div>

              {/* Skip Button */}
              <div className="text-center">
                <Link href={`/game/${gameId}`}>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    size="sm"
                  >
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
