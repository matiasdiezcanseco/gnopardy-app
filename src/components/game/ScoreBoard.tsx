"use client";

import { PlayerList } from "~/components/player/PlayerList";
import { cn } from "~/lib/utils";
import type { Player } from "~/server/db/schema";

interface ScoreBoardProps {
  players: Player[];
  selectedPlayerId?: number | null;
  onSelectPlayer?: (playerId: number) => void;
  title?: string;
  className?: string;
}

export function ScoreBoard({
  players,
  selectedPlayerId,
  onSelectPlayer,
  title = "Scoreboard",
  className,
}: ScoreBoardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-lg",
        className
      )}
    >
      <h2 className="mb-4 text-xl font-bold text-card-foreground">{title}</h2>
      <PlayerList
        players={players}
        selectedPlayerId={selectedPlayerId}
        onSelectPlayer={onSelectPlayer}
        showRank
      />
    </div>
  );
}

