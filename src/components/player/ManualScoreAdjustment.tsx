"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { updatePlayerScore } from "~/server/actions/player";
import { cn } from "~/lib/utils";
import type { Player } from "~/server/db/schema";

interface ManualScoreAdjustmentProps {
  players: Player[];
  onScoreUpdated: (updatedPlayer: Player) => void;
  className?: string;
}

export function ManualScoreAdjustment({
  players,
  onScoreUpdated,
  className,
}: ManualScoreAdjustmentProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [pointsAmount, setPointsAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAdjustPoints = async (delta: number) => {
    if (!selectedPlayerId || !pointsAmount) {
      setMessage({ type: "error", text: "Please select a player and enter points" });
      return;
    }

    const amount = parseInt(pointsAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", text: "Please enter a valid positive number" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const pointsDelta = delta === 1 ? amount : -amount;
      const result = await updatePlayerScore(selectedPlayerId, pointsDelta);

      if (result.success) {
        onScoreUpdated(result.data);
        setMessage({
          type: "success",
          text: `${delta === 1 ? "Added" : "Subtracted"} $${amount}`,
        });
        setPointsAmount("");
        // Clear message after 2 seconds
        setTimeout(() => setMessage(null), 2000);
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update score" });
      console.error("Error adjusting score:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-lg",
        className
      )}
    >
      <h2 className="mb-3 text-base font-bold text-foreground">
        Adjust Scores
      </h2>

      {/* Player Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Select Player
        </label>
        <div className="space-y-1.5">
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
                onClick={() => setSelectedPlayerId(player.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5",
                  "transition-all duration-200",
                  "border text-left",
                  isSelected
                    ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                    : "bg-card border-border hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full",
                    "text-xs font-bold flex-shrink-0",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "text-sm font-semibold truncate",
                      isSelected && "text-primary"
                    )}
                  >
                    {player.name}
                  </div>
                </div>
                <div className="text-xs font-medium tabular-nums text-muted-foreground">
                  ${player.score.toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Points Input and Actions */}
      {selectedPlayer && (
        <div className="space-y-2.5 pt-3 border-t mt-3">
          <div className="space-y-1.5">
            <label
              htmlFor="points-amount"
              className="text-xs font-medium text-muted-foreground"
            >
              Points Amount
            </label>
            <Input
              id="points-amount"
              type="number"
              placeholder="Enter points"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(e.target.value)}
              min="0"
              step="100"
              className="h-9 text-sm"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-1.5">
            <Button
              onClick={() => handleAdjustPoints(1)}
              disabled={isLoading || !pointsAmount}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9 text-sm"
              size="sm"
            >
              + Add
            </Button>
            <Button
              onClick={() => handleAdjustPoints(-1)}
              disabled={isLoading || !pointsAmount}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white h-9 text-sm"
              size="sm"
            >
              - Subtract
            </Button>
          </div>

          {/* Status Message */}
          {message && (
            <div
              className={cn(
                "text-xs text-center py-1.5 px-2 rounded-md font-medium",
                message.type === "success"
                  ? "bg-green-500/10 text-green-600 border border-green-500/20"
                  : "bg-red-500/10 text-red-600 border border-red-500/20"
              )}
            >
              {message.text}
            </div>
          )}

          {/* Quick Points Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Quick Adjust
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[100, 200, 300, 400, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setPointsAmount(amount.toString())}
                  disabled={isLoading}
                  className="h-7 text-xs px-2"
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {players.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-3">
          No players available.
        </div>
      )}
    </div>
  );
}

