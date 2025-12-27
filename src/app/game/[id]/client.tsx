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

  // Check if game is completed (all questions answered)
  const allQuestionsAnswered = questions.every((q) => q.isAnswered);

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
    <div className="bg-background text-foreground min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="bg-card/50 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-primary hover:text-primary/80 text-xl font-bold transition-colors"
          >
            Jeopardy!
          </Link>
          <div className="flex items-center gap-4">
            <ResetGameButton gameId={game.id} />
            <span className="text-muted-foreground text-sm font-medium">
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

      <main className="container mx-auto px-6 py-8">
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
                    <p className="text-muted-foreground mb-2 text-xl">Winner</p>
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
      </main>
    </div>
  );
}
