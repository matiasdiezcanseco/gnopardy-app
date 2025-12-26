import { Suspense } from "react";
import {
  getTopPlayersByScore,
  getTopPlayersByWins,
  getTopPlayersByAverage,
} from "~/server/actions";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";

export const metadata = {
  title: "Leaderboard - Jeopardy",
  description: "Top players and rankings",
};

async function LeaderboardLists() {
  const [scoreResult, winsResult, averageResult] = await Promise.all([
    getTopPlayersByScore(10),
    getTopPlayersByWins(10),
    getTopPlayersByAverage(10),
  ]);

  const topByScore = scoreResult.success ? scoreResult.data : [];
  const topByWins = winsResult.success ? winsResult.data : [];
  const topByAverage = averageResult.success ? averageResult.data : [];

  const getMedal = (position: number) => {
    switch (position) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `#${position + 1}`;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Top by Total Score */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Top by Total Score
        </h2>
        <div className="space-y-3">
          {topByScore.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No players yet
            </p>
          ) : (
            topByScore.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold w-8">
                    {getMedal(index)}
                  </span>
                  <div>
                    <p className="font-semibold">{player.playerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {player.totalGames} games played
                    </p>
                  </div>
                </div>
                <Badge className="text-base font-bold">
                  {player.totalScore}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Top by Wins */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">👑</span>
          Top by Wins
        </h2>
        <div className="space-y-3">
          {topByWins.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No players yet
            </p>
          ) : (
            topByWins.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold w-8">
                    {getMedal(index)}
                  </span>
                  <div>
                    <p className="font-semibold">{player.playerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {player.totalGames} games played
                    </p>
                  </div>
                </div>
                <Badge className="text-base font-bold">{player.totalWins}</Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Top by Average Score */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          Top by Average
        </h2>
        <div className="space-y-3">
          {topByAverage.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No players yet
            </p>
          ) : (
            topByAverage.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold w-8">
                    {getMedal(index)}
                  </span>
                  <div>
                    <p className="font-semibold">{player.playerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {player.totalGames} games played
                    </p>
                  </div>
                </div>
                <Badge className="text-base font-bold">
                  {player.averageScore.toFixed(0)}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold">Leaderboard</h1>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
        <p className="text-muted-foreground">
          Top players ranked by various metrics
        </p>
      </div>

      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardLists />
      </Suspense>
    </div>
  );
}

