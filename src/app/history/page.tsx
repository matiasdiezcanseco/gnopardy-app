import { Suspense } from "react";
import { getGameHistory } from "~/server/actions";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";

export const metadata = {
  title: "Game History - Jeopardy",
  description: "View past game sessions and results",
};

async function GameHistoryList() {
  const result = await getGameHistory(50);

  if (!result.success) {
    return (
      <Card className="p-6">
        <p className="text-center text-destructive">
          Failed to load game history
        </p>
      </Card>
    );
  }

  const history = result.data;

  if (history.length === 0) {
    return (
      <Card className="p-12">
        <p className="text-center text-muted-foreground">
          No games have been completed yet. Start a game to see history!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((game) => {
        const scores = game.finalScores as Array<{
          playerId: number;
          playerName: string;
          score: number;
        }>;

        // Find winner (highest score)
        const winner = scores?.reduce((prev, current) =>
          prev.score > current.score ? prev : current
        );

        return (
          <Card key={game.id} className="p-6 hover:bg-accent transition-colors">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{game.gameName}</h3>
                  <Badge variant="outline">
                    {game.answeredQuestions} / {game.totalQuestions} questions
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground mb-3">
                  Completed on{" "}
                  {new Date(game.completedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {game.duration && (
                    <span className="ml-2">
                      • Duration: {Math.floor(game.duration / 60)}m{" "}
                      {game.duration % 60}s
                    </span>
                  )}
                </div>

                {scores && scores.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Final Scores:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {scores.map((player) => (
                        <div
                          key={player.playerId}
                          className="flex items-center justify-between bg-secondary/50 rounded-md px-3 py-2"
                        >
                          <span className="font-medium">
                            {player.playerName}
                            {winner?.playerId === player.playerId && (
                              <span className="ml-2 text-yellow-500">👑</span>
                            )}
                          </span>
                          <Badge variant="secondary">{player.score} pts</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function GameHistorySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-64 mb-2" />
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold">Game History</h1>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
        <p className="text-muted-foreground">
          View all completed game sessions and their results
        </p>
      </div>

      <Suspense fallback={<GameHistorySkeleton />}>
        <GameHistoryList />
      </Suspense>
    </div>
  );
}

