"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { FinalJeopardyWager } from "~/components/question/FinalJeopardyWager";
import { FinalJeopardyResults } from "~/components/question/FinalJeopardyResults";
import { AudioPlayer } from "~/components/question/AudioPlayer";
import { VideoPlayer } from "~/components/question/VideoPlayer";
import { ImageDisplay } from "~/components/question/ImageDisplay";
import {
  createWager,
  validateFinalJeopardyAnswer,
} from "~/server/actions/finalJeopardy";
import { cn } from "~/lib/utils";
import type { Game, Player } from "~/server/db/schema";
import type { FinalJeopardyWager as FinalJeopardyWagerType } from "~/server/db/schema";

interface FinalJeopardyClientProps {
  game: Game & { players: Player[] };
  question: {
    id: number;
    text: string;
    type: string;
    mediaUrl: string | null;
    categoryName: string;
  };
  existingWagers: Array<
    FinalJeopardyWagerType & {
      player: { id: number; name: string; score: number };
    }
  >;
}

type GamePhase = "wager" | "question" | "results";

export function FinalJeopardyClient({
  game,
  question,
  existingWagers: initialWagers,
}: FinalJeopardyClientProps) {
  const [phase, setPhase] = useState<GamePhase>("wager");
  const [wagers, setWagers] = useState(initialWagers);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(
    game.players[0]?.id ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [validatingPlayer, setValidatingPlayer] = useState<number | null>(null);

  // Check if all wagers are submitted
  const allWagersSubmitted = game.players.every((player) =>
    wagers.some((w) => w.playerId === player.id),
  );

  // Check if all players have been judged (correct or incorrect marked)
  const allPlayersJudged =
    wagers.length > 0 &&
    game.players.every((player) => {
      const wager = wagers.find((w) => w.playerId === player.id);
      return wager && wager.isCorrect !== null;
    });

  // Determine initial phase based on existing wagers
  useEffect(() => {
    // If no wagers yet, start at wager phase
    if (wagers.length === 0) {
      setPhase("wager");
      return;
    }

    // If all players judged, show results
    if (allPlayersJudged) {
      setPhase("results");
      return;
    }

    // If all wagers in but not all judged, show question
    if (allWagersSubmitted) {
      setPhase("question");
      return;
    }

    // Otherwise, still collecting wagers
    setPhase("wager");
  }, [wagers.length, allWagersSubmitted, allPlayersJudged]);

  const selectedPlayer = game.players.find((p) => p.id === selectedPlayerId);
  const currentWager = wagers.find((w) => w.playerId === selectedPlayerId);

  const handleWagerSubmit = async (wagerAmount: number) => {
    if (!selectedPlayerId) return;

    setError(null);

    try {
      const result = await createWager({
        gameId: game.id,
        playerId: selectedPlayerId,
        questionId: question.id,
        wagerAmount,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Update local wagers state, ensuring we include the player object
      setWagers((prev) => {
        const existing = prev.find((w) => w.playerId === selectedPlayerId);
        const selectedPlayerData = game.players.find(
          (p) => p.id === selectedPlayerId,
        );

        if (!selectedPlayerData) return prev;

        const newWager = {
          ...result.data,
          player: {
            id: selectedPlayerId,
            name: selectedPlayerData.name,
            score: selectedPlayerData.score,
          },
        };

        if (existing) {
          return prev.map((w) =>
            w.playerId === selectedPlayerId ? newWager : w,
          );
        }
        return [...prev, newWager];
      });

      // Move to next player who hasn't wagered
      const nextPlayer = game.players.find(
        (p) =>
          p.id !== selectedPlayerId && !wagers.some((w) => w.playerId === p.id),
      );

      if (nextPlayer) {
        setSelectedPlayerId(nextPlayer.id);
      }

      // Check if all wagers are now submitted
      const updatedWagersCount =
        wagers.filter((w) => w.playerId !== selectedPlayerId).length + 1;

      if (updatedWagersCount === game.players.length) {
        // All wagers submitted, can move to question phase
        setPhase("question");
        setSelectedPlayerId(game.players[0]?.id ?? null);
      }
    } catch (err) {
      setError("Failed to submit wager");
      console.error(err);
    }
  };

  const handleMarkCorrect = async (playerId: number, isCorrect: boolean) => {
    const wager = wagers.find((w) => w.playerId === playerId);
    if (!wager) {
      setError("No wager found for this player");
      return;
    }

    setValidatingPlayer(playerId);
    setError(null);

    try {
      const result = await validateFinalJeopardyAnswer(wager.id, isCorrect);

      if (!result.success) {
        setError(result.error);
        setValidatingPlayer(null);
        return;
      }

      // Update local wagers state for the current player
      setWagers((prev) =>
        prev.map((w) =>
          w.playerId === playerId
            ? {
                ...w,
                isCorrect,
                hasAnswered: true,
                player: {
                  ...w.player,
                  score: result.data.newScore,
                },
              }
            : w,
        ),
      );

      // If marking as correct, automatically mark all others as incorrect
      if (isCorrect) {
        // Get all other players who haven't been judged yet
        const otherWagers = wagers.filter(
          (w) => w.playerId !== playerId && w.isCorrect === null,
        );

        // Mark each other player as incorrect
        for (const otherWager of otherWagers) {
          try {
            const otherResult = await validateFinalJeopardyAnswer(
              otherWager.id,
              false,
            );

            if (otherResult.success) {
              // Update local state for this player
              setWagers((prev) =>
                prev.map((w) =>
                  w.id === otherWager.id
                    ? {
                        ...w,
                        isCorrect: false,
                        hasAnswered: true,
                        player: {
                          ...w.player,
                          score: otherResult.data.newScore,
                        },
                      }
                    : w,
                ),
              );
            }
          } catch (err) {
            console.error("Error marking other player as incorrect:", err);
          }
        }

        // After marking all, move to results
        setTimeout(() => {
          setPhase("results");
        }, 500);
      } else {
        // If marking as incorrect, check if all players have been judged
        const allJudged = wagers.every((w) => {
          if (w.playerId === playerId) return true;
          return w.isCorrect !== null;
        });

        if (allJudged) {
          // Move to results after a short delay
          setTimeout(() => {
            setPhase("results");
          }, 500);
        }
      }
    } catch (err) {
      setError("Failed to validate answer");
      console.error(err);
    } finally {
      setValidatingPlayer(null);
    }
  };

  const handleProceedToQuestion = () => {
    if (allWagersSubmitted) {
      setPhase("question");
      setSelectedPlayerId(game.players[0]?.id ?? null);
    }
  };

  const handleShowResults = () => {
    setPhase("results");
  };

  return (
    <div className="bg-background text-foreground min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="bg-card/50 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/game/${game.id}`}
              className="text-primary hover:text-primary/80 text-xl font-bold transition-colors"
            >
              Gnopardy!
            </Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-foreground text-lg font-semibold">
              Final Jeopardy
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-bold">
              Game #{game.id}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Phase Indicator */}
          <div className="flex items-center justify-center gap-4">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                phase === "wager"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              1
            </div>
            <div className="text-muted-foreground">Wagers</div>
            <div className="bg-border h-0.5 w-12" />
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                phase === "question"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              2
            </div>
            <div className="text-muted-foreground">Question</div>
            <div className="bg-border h-0.5 w-12" />
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                phase === "results"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              3
            </div>
            <div className="text-muted-foreground">Results</div>
          </div>

          {/* Category Display */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Category: {question.categoryName}
              </CardTitle>
            </CardHeader>
          </Card>

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg border p-4">
              {error}
            </div>
          )}

          {/* Phase-specific content */}
          {phase === "wager" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Place Your Wagers</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Each player should wager an amount up to their current
                    score. The host will orchestrate this in person.
                  </p>
                </CardHeader>
              </Card>

              {/* Player Selector */}
              <div className="flex flex-wrap gap-2">
                {game.players.map((player) => {
                  const hasWagered = wagers.some(
                    (w) => w.playerId === player.id,
                  );
                  const isSelected = selectedPlayerId === player.id;

                  return (
                    <button
                      key={player.id}
                      onClick={() => setSelectedPlayerId(player.id)}
                      disabled={hasWagered}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-4 py-2 transition-all",
                        isSelected &&
                          !hasWagered &&
                          "border-primary bg-primary/10",
                        hasWagered &&
                          "cursor-not-allowed border-green-500/30 bg-green-500/10 opacity-60",
                        !isSelected &&
                          !hasWagered &&
                          "border-border hover:border-primary/50",
                      )}
                    >
                      <span className="font-medium">{player.name}</span>
                      <span className="text-muted-foreground text-sm">
                        ${player.score.toLocaleString()}
                      </span>
                      {hasWagered && (
                        <span className="text-xs text-green-600">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Wager Form */}
              {selectedPlayer && !currentWager && (
                <FinalJeopardyWager
                  playerId={selectedPlayer.id}
                  playerName={selectedPlayer.name}
                  currentScore={selectedPlayer.score}
                  onWagerSubmit={handleWagerSubmit}
                />
              )}

              {currentWager && (
                <FinalJeopardyWager
                  playerId={selectedPlayer!.id}
                  playerName={selectedPlayer!.name}
                  currentScore={selectedPlayer!.score}
                  onWagerSubmit={handleWagerSubmit}
                  existingWager={currentWager.wagerAmount}
                  hasAnswered={false}
                />
              )}

              {/* Proceed Button */}
              {allWagersSubmitted && (
                <div className="flex justify-center">
                  <Button size="lg" onClick={handleProceedToQuestion}>
                    Proceed to Question →
                  </Button>
                </div>
              )}
            </div>
          )}

          {phase === "question" && (
            <div className="space-y-6">
              {/* Question Display */}
              <Card>
                <CardHeader>
                  <CardTitle>Final Jeopardy Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground text-xl leading-relaxed">
                    {question.text}
                  </p>

                  {/* Media Display */}
                  {question.type === "audio" && question.mediaUrl && (
                    <AudioPlayer src={question.mediaUrl} />
                  )}

                  {question.type === "video" && question.mediaUrl && (
                    <VideoPlayer src={question.mediaUrl} />
                  )}

                  {question.type === "image" && question.mediaUrl && (
                    <ImageDisplay
                      src={question.mediaUrl}
                      alt="Question image"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Host Instructions */}
              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardHeader>
                  <CardTitle className="text-lg">Host Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Ask players to write down their answers. After all players
                    have finished, reveal each answer and mark them as correct
                    or incorrect below.
                  </p>
                </CardContent>
              </Card>

              {/* Player Judgment */}
              <Card>
                <CardHeader>
                  <CardTitle>Mark Player Answers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {game.players.map((player) => {
                      const wager = wagers.find(
                        (w) => w.playerId === player.id,
                      );
                      const isJudged = wager?.isCorrect !== null;
                      const isValidating = validatingPlayer === player.id;

                      return (
                        <div
                          key={player.id}
                          className={cn(
                            "flex items-center justify-between gap-4 rounded-lg border p-4",
                            isJudged &&
                              wager?.isCorrect &&
                              "border-green-500/30 bg-green-500/5",
                            isJudged &&
                              !wager?.isCorrect &&
                              "border-red-500/30 bg-red-500/5",
                          )}
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{player.name}</p>
                            <p className="text-muted-foreground text-sm">
                              Wagered: $
                              {wager?.wagerAmount.toLocaleString() ?? 0}
                            </p>
                          </div>

                          {isJudged ? (
                            <Badge
                              variant={
                                wager?.isCorrect ? "default" : "destructive"
                              }
                            >
                              {wager?.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                            </Badge>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  handleMarkCorrect(player.id, true)
                                }
                                disabled={isValidating}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {isValidating ? "..." : "✓ Correct"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleMarkCorrect(player.id, false)
                                }
                                disabled={isValidating}
                              >
                                {isValidating ? "..." : "✗ Incorrect"}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Show Results Button */}
              {allPlayersJudged && (
                <div className="flex justify-center">
                  <Button size="lg" onClick={handleShowResults}>
                    Show Results →
                  </Button>
                </div>
              )}
            </div>
          )}

          {phase === "results" && (
            <div className="space-y-6">
              <FinalJeopardyResults wagers={wagers} />

              <div className="flex justify-center gap-4">
                <Link href={`/game/${game.id}`}>
                  <Button size="lg" variant="outline">
                    Back to Game Board
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="lg">Start New Game</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
