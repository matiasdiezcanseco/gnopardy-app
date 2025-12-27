"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { GameBoard } from "~/components/game/GameBoard";
import { ScoreBoard } from "~/components/game/ScoreBoard";
import { PlayerSelector } from "~/components/player/PlayerSelector";
import { AddPlayer } from "~/components/player/AddPlayer";
import { ResetGameButton } from "~/components/game/ResetGameButton";
import { Button } from "~/components/ui/button";
import { checkGameCompletion } from "~/server/actions/game";
import type { Game, Category, Player } from "~/server/db/schema";
import { cn } from "~/lib/utils";

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
    (game.status as "active" | "completed") || "active"
  );
  const [winner, setWinner] = useState<Player | null>(null);

  const handlePlayerAdded = useCallback((player: Player) => {
    setPlayers((prev) => [...prev, player]);
    setShowAddPlayer(false);
  }, []);

  const handleSelectPlayer = useCallback((playerId: number) => {
    setSelectedPlayerId(playerId);
  }, []);

  // Check if game is completed (all questions answered)
  const allQuestionsAnswered = questions.every((q) => q.isAnswered);

  // Check for game completion when questions change
  useEffect(() => {
    if (allQuestionsAnswered && gameStatus === "active") {
      checkGameCompletion(game.id).then((result) => {
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
            Jeopardy!
          </Link>
          <div className="flex items-center gap-4">
            <ResetGameButton gameId={game.id} />
            <span className="text-sm font-medium text-muted-foreground">
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
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">
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
              <div className="rounded-xl border border-secondary bg-card p-12 text-center shadow-md">
                <h2 className="text-3xl font-bold text-primary mb-6">
                  🎉 Game Complete!
                </h2>
                {winner && (
                  <div className="mb-8 p-6 rounded-lg bg-secondary/10 border border-secondary/20 inline-block min-w-[300px]">
                    <p className="text-xl text-muted-foreground mb-2">Winner</p>
                    <p className="text-4xl font-bold text-primary mb-2">{winner.name}</p>
                    <p className="text-2xl font-semibold text-foreground">
                      ${winner.score.toLocaleString()}
                    </p>
                  </div>
                )}
                <p className="text-lg text-muted-foreground mb-8">
                  All questions have been answered. Check the scoreboard for final results!
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/">
                    <Button size="lg" className="px-8">Start New Game</Button>
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
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <ScoreBoard
              players={players}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={handleSelectPlayer}
              title="Scoreboard"
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
