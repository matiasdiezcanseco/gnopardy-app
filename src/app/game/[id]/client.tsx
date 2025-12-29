"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { GameBoard } from "~/components/game/GameBoard";
import { ScoreBoard } from "~/components/game/ScoreBoard";
import { PlayerSelector } from "~/components/player/PlayerSelector";
import { AddPlayer } from "~/components/player/AddPlayer";
import { ManualScoreAdjustment } from "~/components/player/ManualScoreAdjustment";
import { ResetGameButton } from "~/components/game/ResetGameButton";
import { Button } from "~/components/ui/button";
import { checkGameCompletion } from "~/server/actions/game";
import { cn } from "~/lib/utils";
import type { Game, Category, Player } from "~/server/db/schema";

interface QuestionWithCategory {
  id: number;
  categoryId: number;
  text: string;
  points: number;
  type: string;
  mediaUrl: string | null;
  isAnswered: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  category: { id: number; name: string } | null;
}

interface GamePageClientProps {
  game: Game & { players: Player[] };
  categories: Category[];
  questions: QuestionWithCategory[];
}

export function GamePageClient({
  game,
  categories,
  questions: initialQuestions,
}: GamePageClientProps) {
  const [players, setPlayers] = useState<Player[]>(game.players);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [questions, setQuestions] = useState(initialQuestions);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [gameStatus, setGameStatus] = useState<"active" | "completed">(
    (game.status as "active" | "completed") || "active",
  );
  const [winner, setWinner] = useState<Player | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePlayerAdded = useCallback((player: Player) => {
    setPlayers((prev) => [...prev, player]);
    setShowAddPlayer(false);
  }, []);

  const handleSelectPlayer = useCallback((playerId: number) => {
    setSelectedPlayerId(playerId);
  }, []);

  const handleScoreUpdated = useCallback((updatedPlayer: Player) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)),
    );
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error("Error attempting to exit fullscreen:", err);
      }
    }
  }, []);

  // Listen for fullscreen changes (e.g., user presses ESC or F11)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Listen for F11 key press to trigger fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F11 key
      if (event.key === "F11") {
        event.preventDefault(); // Prevent default browser fullscreen
        void toggleFullscreen(); // Use our custom fullscreen instead
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleFullscreen]);

  // Check if game is completed (all questions answered)
  const allQuestionsAnswered = questions.every((q) => q.isAnswered);

  // Check if there's a Final Jeopardy category
  const hasFinalJeopardy = categories.some((c) => c.isFinalJeopardy);

  // Check for game completion when questions change
  useEffect(() => {
    if (allQuestionsAnswered && gameStatus === "active") {
      void checkGameCompletion(game.id).then((result) => {
        if (result.success && result.data.isComplete) {
          setGameStatus("completed");
          if (result.data.winner) {
            setWinner(result.data.winner);
          }
        }
      });
    }
  }, [allQuestionsAnswered, gameStatus, game.id]);

  return (
    <div
      className={cn(
        "bg-background text-foreground min-h-screen transition-colors duration-300",
        isFullscreen && "h-screen overflow-hidden",
      )}
    >
      {/* Header */}
      <header
        className={cn(
          "bg-card/50 border-b backdrop-blur",
          isFullscreen ? "sticky top-0 z-50 py-2" : "sticky top-0 z-50",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center justify-between px-4",
            isFullscreen ? "py-2" : "py-4 sm:px-6 lg:px-8",
          )}
        >
          <Link
            href="/"
            className={cn(
              "text-primary hover:text-primary/80 font-bold transition-colors",
              isFullscreen ? "text-base" : "text-xl",
            )}
          >
            Gnopardy!
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size={isFullscreen ? "sm" : "default"}
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="ml-2 hidden sm:inline">Exit</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                  <span className="ml-2 hidden sm:inline">Fullscreen</span>
                </>
              )}
            </Button>
            {!isFullscreen && <ResetGameButton gameId={game.id} />}
            <span
              className={cn(
                "text-muted-foreground font-medium",
                isFullscreen ? "text-xs" : "text-sm",
              )}
            >
              Game #{game.id}
            </span>
            {gameStatus === "completed" && (
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-600 dark:text-green-400">
                Completed
              </span>
            )}
          </div>
        </div>
      </header>

      <main
        className={cn(
          "w-full",
          isFullscreen
            ? "h-[calc(100vh-56px)] overflow-hidden"
            : "px-4 py-8 sm:px-6 lg:px-8",
        )}
      >
        {isFullscreen ? (
          /* Fullscreen Layout */
          <div className="flex h-full flex-col gap-2 p-2">
            {/* Compact Top Bar - Player Selection and Scoreboard */}
            <div className="flex gap-2">
              {/* Compact Player Selection */}
              <div className="bg-card/80 flex-shrink-0 rounded-lg border p-2 backdrop-blur">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-foreground text-xs font-semibold">
                    Player
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setShowAddPlayer(!showAddPlayer)}
                  >
                    {showAddPlayer ? "✕" : "+"}
                  </Button>
                </div>

                {showAddPlayer && (
                  <div className="mb-2">
                    <AddPlayer
                      gameId={game.id}
                      onPlayerAdded={handlePlayerAdded}
                    />
                  </div>
                )}

                {/* Compact Player Selector */}
                <div className="flex max-w-md flex-wrap gap-1">
                  {players.length === 0 ? (
                    <div className="text-muted-foreground py-2 text-xs">
                      Add players to start
                    </div>
                  ) : (
                    players.map((player) => {
                      const isSelected = selectedPlayerId === player.id;
                      const initials = player.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <button
                          key={player.id}
                          onClick={() => handleSelectPlayer(player.id)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs",
                            "border transition-all duration-200",
                            isSelected
                              ? "bg-primary/10 text-primary border-primary shadow-md"
                              : "bg-card text-card-foreground border-border hover:bg-accent hover:border-accent",
                          )}
                          title={`${player.name} - $${player.score.toLocaleString()}`}
                        >
                          <div
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground",
                            )}
                          >
                            {initials}
                          </div>
                          <div className="text-left">
                            <div className="leading-none font-medium">
                              {player.name}
                            </div>
                            <div
                              className={cn(
                                "mt-0.5 text-xs leading-none",
                                isSelected
                                  ? "text-primary"
                                  : "text-muted-foreground",
                              )}
                            >
                              ${player.score.toLocaleString()}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Compact Scoreboard */}
              <div className="bg-card/80 max-w-sm flex-1 rounded-lg border p-2 backdrop-blur">
                <h3 className="text-foreground mb-2 text-xs font-semibold">
                  Scoreboard
                </h3>
                <div className="fullscreen-scrollbar max-h-24 space-y-1 overflow-y-auto">
                  {[...players]
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5)
                    .map((player, index) => (
                      <div
                        key={player.id}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded px-2 py-1",
                          selectedPlayerId === player.id
                            ? "bg-primary/10 border-primary/20 border"
                            : "bg-card/50",
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="text-muted-foreground w-4 text-xs font-bold">
                            #{index + 1}
                          </span>
                          <span className="truncate text-xs font-medium">
                            {player.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold tabular-nums">
                          ${player.score.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Main Game Board - Full Focus */}
            <div className="flex-1 overflow-auto">
              {allQuestionsAnswered ? (
                <div className="border-secondary bg-card flex h-full flex-col items-center justify-center rounded-xl border p-12 text-center shadow-md">
                  <h2 className="text-primary mb-6 text-3xl font-bold">
                    🎉 Game Complete!
                  </h2>
                  {winner && (
                    <div className="bg-secondary/10 border-secondary/20 mb-8 inline-block min-w-[300px] rounded-lg border p-6">
                      <p className="text-muted-foreground mb-2 text-xl">
                        Winner
                      </p>
                      <p className="text-primary mb-2 text-4xl font-bold">
                        {winner.name}
                      </p>
                      <p className="text-foreground text-2xl font-semibold">
                        ${winner.score.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <p className="text-muted-foreground mb-8 text-lg">
                    All questions have been answered. Check the scoreboard for
                    final results!
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      size="lg"
                      className="px-8"
                      onClick={toggleFullscreen}
                    >
                      Exit Fullscreen
                    </Button>
                  </div>
                </div>
              ) : (
                <GameBoard
                  categories={categories}
                  questions={questions}
                  gameId={game.id}
                  selectedPlayerId={selectedPlayerId}
                  hasFinalJeopardy={hasFinalJeopardy}
                />
              )}
            </div>
          </div>
        ) : (
          /* Regular Layout */
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Main Game Area */}
            <div className="space-y-8">
              {/* Player Selection */}
              <div className="bg-card rounded-xl border p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-foreground text-lg font-bold">
                    Select Player
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddPlayer(!showAddPlayer)}
                  >
                    {showAddPlayer ? "Cancel" : "+ Add Player"}
                  </Button>
                </div>

                {showAddPlayer && (
                  <div className="mb-6">
                    <AddPlayer
                      gameId={game.id}
                      onPlayerAdded={handlePlayerAdded}
                    />
                  </div>
                )}

                <PlayerSelector
                  players={players}
                  selectedPlayerId={selectedPlayerId}
                  onSelectPlayer={handleSelectPlayer}
                />
              </div>

              {/* Game Board */}
              {allQuestionsAnswered ? (
                <div className="border-secondary bg-card rounded-xl border p-12 text-center shadow-md">
                  <h2 className="text-primary mb-6 text-3xl font-bold">
                    🎉 Game Complete!
                  </h2>
                  {winner && (
                    <div className="bg-secondary/10 border-secondary/20 mb-8 inline-block min-w-[300px] rounded-lg border p-6">
                      <p className="text-muted-foreground mb-2 text-xl">
                        Winner
                      </p>
                      <p className="text-primary mb-2 text-4xl font-bold">
                        {winner.name}
                      </p>
                      <p className="text-foreground text-2xl font-semibold">
                        ${winner.score.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <p className="text-muted-foreground mb-8 text-lg">
                    All questions have been answered. Check the scoreboard for
                    final results!
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link href="/">
                      <Button size="lg" className="px-8">
                        Start New Game
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <GameBoard
                  categories={categories}
                  questions={questions}
                  gameId={game.id}
                  selectedPlayerId={selectedPlayerId}
                  hasFinalJeopardy={hasFinalJeopardy}
                />
              )}
            </div>

            {/* Sidebar - Scoreboard */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <ScoreBoard
                players={players}
                selectedPlayerId={selectedPlayerId}
                onSelectPlayer={handleSelectPlayer}
                title="Scoreboard"
              />

              {/* Manual Score Adjustment */}
              <ManualScoreAdjustment
                players={players}
                onScoreUpdated={handleScoreUpdated}
              />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
