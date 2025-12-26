"use client";

import { useState, useTransition } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createPlayer } from "~/server/actions/player";
import type { Player } from "~/server/db/schema";

interface AddPlayerProps {
  gameId: number;
  onPlayerAdded: (player: Player) => void;
}

export function AddPlayer({ gameId, onPlayerAdded }: AddPlayerProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter a player name");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    startTransition(async () => {
      const result = await createPlayer({
        name: trimmedName,
        gameId,
        score: 0,
      });

      if (result.success) {
        onPlayerAdded(result.data);
        setName("");
        setError(null);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter player name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          className="flex-1"
          maxLength={256}
        />
        <Button type="submit" disabled={isPending || !name.trim()}>
          {isPending ? "Adding..." : "Add Player"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}

