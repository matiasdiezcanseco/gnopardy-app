"use client";

import { cn } from "~/lib/utils";
import type { Player } from "~/server/db/schema";

interface PlayerSelectorProps {
  players: Player[];
  selectedPlayerId: number | null;
  onSelectPlayer: (playerId: number) => void;
}

export function PlayerSelector({
  players,
  selectedPlayerId,
  onSelectPlayer,
}: PlayerSelectorProps) {
  if (players.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No players yet. Add players to start playing!
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {players.map((player) => {
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
            onClick={() => onSelectPlayer(player.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3",
              "transition-all duration-200",
              "border-2",
              isSelected
                ? [
                    "bg-amber-500 text-black border-amber-400",
                    "shadow-lg shadow-amber-500/30",
                    "scale-105",
                  ]
                : [
                    "bg-card text-card-foreground border-border",
                    "hover:bg-accent hover:border-accent",
                    "hover:scale-[1.02]",
                  ]
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                "text-sm font-bold",
                isSelected
                  ? "bg-amber-600 text-white"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {initials}
            </div>

            {/* Name and Score */}
            <div className="text-left">
              <div className="font-semibold">{player.name}</div>
              <div
                className={cn(
                  "text-sm",
                  isSelected ? "text-amber-900" : "text-muted-foreground"
                )}
              >
                ${player.score.toLocaleString()}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

