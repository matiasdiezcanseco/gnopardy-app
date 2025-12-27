"use client";

import { cn } from "~/lib/utils";
import type { Player } from "~/server/db/schema";

interface PlayerListProps {
  players: Player[];
  selectedPlayerId?: number | null;
  onSelectPlayer?: (playerId: number) => void;
  showRank?: boolean;
}

export function PlayerList({
  players,
  selectedPlayerId,
  onSelectPlayer,
  showRank = false,
}: PlayerListProps) {
  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  if (players.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No players in this game yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedPlayers.map((player, index) => {
        const isSelected = selectedPlayerId === player.id;
        const initials = player.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        const rank = index + 1;

        return (
          <div
            key={player.id}
            onClick={() => onSelectPlayer?.(player.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3",
              "transition-all duration-200",
              "border",
              onSelectPlayer && "cursor-pointer",
              isSelected
                ? [
                    "bg-primary/10 border-primary",
                    "shadow-lg shadow-primary/10",
                  ]
                : ["bg-card border-border", onSelectPlayer && "hover:bg-accent hover:text-accent-foreground"]
            )}
          >
            {/* Rank */}
            {showRank && (
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                  rank === 1 && "bg-yellow-500 text-black", // Gold
                  rank === 2 && "bg-gray-400 text-black",   // Silver
                  rank === 3 && "bg-orange-700 text-white", // Bronze
                  rank > 3 && "bg-muted text-muted-foreground"
                )}
              >
                {rank}
              </div>
            )}

            {/* Avatar */}
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                "text-sm font-bold",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {initials}
            </div>

            {/* Name */}
            <div className="flex-1">
              <div
                className={cn(
                  "font-semibold",
                  isSelected && "text-primary"
                )}
              >
                {player.name}
              </div>
            </div>

            {/* Score */}
            <div
              className={cn(
                "text-xl font-bold tabular-nums",
                player.score >= 0 ? "text-green-500" : "text-red-500"
              )}
            >
              ${player.score.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

