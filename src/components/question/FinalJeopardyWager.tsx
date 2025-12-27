"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface FinalJeopardyWagerProps {
  playerId: number;
  playerName: string;
  currentScore: number;
  onWagerSubmit: (wagerAmount: number) => Promise<void>;
  existingWager?: number;
  hasAnswered?: boolean;
}

export function FinalJeopardyWager({
  playerId,
  playerName,
  currentScore,
  onWagerSubmit,
  existingWager,
  hasAnswered = false,
}: FinalJeopardyWagerProps) {
  const [wagerAmount, setWagerAmount] = useState(
    existingWager?.toString() ?? "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Maximum wager based on current score
  const maxWager = currentScore > 0 ? currentScore : 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseInt(wagerAmount);

    if (isNaN(amount) || amount < 0) {
      setError("Please enter a valid wager amount");
      return;
    }

    if (amount > maxWager) {
      setError(
        `Wager cannot exceed ${currentScore > 0 ? "your current score" : "$1,000"}`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await onWagerSubmit(amount);
    } catch (err) {
      setError("Failed to submit wager");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setQuickWager = (percentage: number) => {
    const amount = Math.floor(maxWager * percentage);
    setWagerAmount(amount.toString());
  };

  if (hasAnswered) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader>
          <CardTitle className="text-lg">Wager Locked</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Your wager:</p>
            <p className="text-primary text-3xl font-bold">
              ${existingWager?.toLocaleString() ?? 0}
            </p>
            <p className="text-muted-foreground mt-4 text-sm">
              Answer submitted. Waiting for results...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Place Your Wager</CardTitle>
        <p className="text-muted-foreground text-sm">
          {playerName} - Current Score: ${currentScore.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Wager Amount</label>
            <div className="flex gap-2">
              <span className="text-muted-foreground flex items-center text-2xl font-bold">
                $
              </span>
              <Input
                type="number"
                min="0"
                max={maxWager}
                value={wagerAmount}
                onChange={(e) => setWagerAmount(e.target.value)}
                placeholder="0"
                className="text-xl"
                disabled={isSubmitting}
                required
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Maximum wager: ${maxWager.toLocaleString()}
            </p>
          </div>

          {/* Quick Wager Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Select</label>
            <div className="grid grid-cols-4 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickWager(0.25)}
                disabled={isSubmitting}
              >
                25%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickWager(0.5)}
                disabled={isSubmitting}
              >
                50%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickWager(0.75)}
                disabled={isSubmitting}
              >
                75%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickWager(1.0)}
                disabled={isSubmitting}
              >
                All In
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || !wagerAmount}
          >
            {isSubmitting
              ? "Submitting..."
              : existingWager !== undefined
                ? "Update Wager"
                : "Lock In Wager"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
