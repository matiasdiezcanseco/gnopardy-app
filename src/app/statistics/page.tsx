import { Suspense } from "react";
import { getAllPlayerStatistics } from "~/server/actions";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";

export const metadata = {
  title: "Statistics - Jeopardy",
  description: "Player statistics and game analytics",
};

async function StatisticsDashboard() {
  const result = await getAllPlayerStatistics();

  if (!result.success) {
    return (
      <Card className="p-6">
        <p className="text-center text-destructive">
          Failed to load statistics
        </p>
      </Card>
    );
  }

  const stats = result.data;

  if (stats.length === 0) {
    return (
      <Card className="p-12">
        <p className="text-center text-muted-foreground">
          No statistics available yet. Play some games to see stats!
        </p>
      </Card>
    );
  }

  // Calculate overall statistics
  const totalGames = stats.reduce((sum, s) => sum + s.totalGames, 0);
  const totalPlayers = stats.length;
  const totalScore = stats.reduce((sum, s) => sum + s.totalScore, 0);
  const overallAverage = totalGames > 0 ? totalScore / totalGames : 0;

  return (
    <div className="space-y-8">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{totalPlayers}</p>
            <p className="text-sm text-muted-foreground mt-2">Total Players</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{totalGames}</p>
            <p className="text-sm text-muted-foreground mt-2">Games Played</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">
              {totalScore.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Total Points</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">
              {overallAverage.toFixed(0)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Avg Score/Game</p>
          </div>
        </Card>
      </div>

      {/* Player Details */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Player Statistics</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Player</th>
                <th className="text-center py-3 px-4 font-semibold">Games</th>
                <th className="text-center py-3 px-4 font-semibold">Wins</th>
                <th className="text-center py-3 px-4 font-semibold">
                  Total Score
                </th>
                <th className="text-center py-3 px-4 font-semibold">Avg Score</th>
                <th className="text-center py-3 px-4 font-semibold">
                  High Score
                </th>
                <th className="text-center py-3 px-4 font-semibold">
                  Last Played
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.map((player, index) => (
                <tr
                  key={player.id}
                  className={`border-b hover:bg-secondary/50 transition-colors ${
                    index % 2 === 0 ? "bg-secondary/20" : ""
                  }`}
                >
                  <td className="py-3 px-4 font-medium">
                    {player.playerName}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {player.totalGames}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="outline">{player.totalWins}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold">
                    {player.totalScore}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {player.averageScore.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge>{player.highestScore}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                    {player.lastPlayed
                      ? new Date(player.lastPlayed).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatisticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-12 w-24 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </Card>
    </div>
  );
}

export default function StatisticsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold">Statistics</h1>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
        <p className="text-muted-foreground">
          Comprehensive player statistics and game analytics
        </p>
      </div>

      <Suspense fallback={<StatisticsSkeleton />}>
        <StatisticsDashboard />
      </Suspense>
    </div>
  );
}

