"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { GameBoard } from "~/components/game/GameBoard";
import { ScoreBoard } from "~/components/game/ScoreBoard";
import { PlayerSelector } from "~/components/player/PlayerSelector";
import { AddPlayer } from "~/components/player/AddPlayer";
import { Button } from "~/components/ui/button";
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

  const handlePlayerAdded = useCallback((player: Player) => {
    setPlayers((prev) => [...prev, player]);
    setShowAddPlayer(false);
  }, []);

  const handleSelectPlayer = useCallback((playerId: number) => {
    setSelectedPlayerId(playerId);
  }, []);

  // Check if game is completed (all questions answered)
  const allQuestionsAnswered = questions.every((q) => q.isAnswered);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-amber-400 transition-colors">
            Jeopardy!
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Game #{game.id}
            </span>
            {game.status === "completed" && (
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                Completed
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main Game Area */}
          <div className="space-y-6">
            {/* Player Selection */}
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
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
                <div className="mb-4">
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
              <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-900/20 to-amber-950/20 p-8 text-center">
                <h2 className="text-3xl font-bold text-amber-400 mb-4">
                  🎉 Game Complete!
                </h2>
                <p className="text-lg text-white/80 mb-6">
                  All questions have been answered. Check the scoreboard for
                  final results!
                </p>
                <Link href="/">
                  <Button size="lg">Start New Game</Button>
                </Link>
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
          <aside className="lg:sticky lg:top-6 lg:self-start">
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

