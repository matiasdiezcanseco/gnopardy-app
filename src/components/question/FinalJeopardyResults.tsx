"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import type { FinalJeopardyWager } from "~/server/db/schema";

interface FinalJeopardyResultsProps {
  wagers: Array<
    FinalJeopardyWager & {
      player: { id: number; name: string; score: number };
    }
  >;
}

export function FinalJeopardyResults({ wagers }: FinalJeopardyResultsProps) {
  // Sort by player score (already updated on server)
  const sortedWagers = [...wagers].sort((a, b) => {
    return b.player.score - a.player.score;
  });

  const winner = sortedWagers[0];

  return (
    <div className="space-y-6">
      {/* Winner Card */}
      {winner && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              🏆 Final Jeopardy Winner!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <h2 className="text-primary mb-4 text-4xl font-bold">
              {winner.player.name}
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div>
                <p className="text-muted-foreground mb-1 text-sm">
                  Final Score
                </p>
                <p className="text-foreground text-3xl font-bold">
                  ${winner.player.score.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Player Results */}
      <Card>
        <CardHeader>
          <CardTitle>Final Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedWagers.map((wager, index) => {
              // player.score is already the final score (updated by server)
              const finalScore = wager.player.score;
              const scoreChange = wager.isCorrect
                ? wager.wagerAmount
                : -wager.wagerAmount;

              return (
                <div
                  key={wager.id}
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-lg border p-4",
                    index === 0 && "border-primary/30 bg-primary/5",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full font-bold",
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{wager.player.name}</p>
                      <p className="text-muted-foreground text-sm">
                        Wagered: ${wager.wagerAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={wager.isCorrect ? "default" : "destructive"}
                    >
                      {wager.isCorrect ? "Correct" : "Incorrect"}
                    </Badge>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            scoreChange >= 0
                              ? "text-green-600"
                              : "text-red-600",
                          )}
                        >
                          {scoreChange >= 0 ? "+" : ""}
                          {scoreChange.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-lg font-bold">
                        ${finalScore.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
