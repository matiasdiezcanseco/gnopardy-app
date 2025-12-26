"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface MultipleChoiceManagerProps {
  value: Answer[];
  onChange: (answers: Answer[]) => void;
  className?: string;
}

export function MultipleChoiceManager({
  value,
  onChange,
  className,
}: MultipleChoiceManagerProps) {
  const [newAnswerText, setNewAnswerText] = useState("");

  const addAnswer = () => {
    if (!newAnswerText.trim()) return;

    const newAnswer: Answer = {
      text: newAnswerText.trim(),
      isCorrect: false,
      order: value.length,
    };

    onChange([...value, newAnswer]);
    setNewAnswerText("");
  };

  const updateAnswer = (index: number, updates: Partial<Answer>) => {
    const updated = value.map((answer, i) =>
      i === index ? { ...answer, ...updates } : answer
    );
    onChange(updated);
  };

  const deleteAnswer = (index: number) => {
    const updated = value
      .filter((_, i) => i !== index)
      .map((answer, i) => ({ ...answer, order: i }));
    onChange(updated);
  };

  const moveAnswer = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === value.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...value];
    const temp = updated[index];
    updated[index] = updated[newIndex]!;
    updated[newIndex] = temp!;

    // Update order
    const reordered = updated.map((answer, i) => ({ ...answer, order: i }));
    onChange(reordered);
  };

  const hasCorrectAnswer = value.some((a) => a.isCorrect);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Answer Options</label>
        {!hasCorrectAnswer && value.length > 0 && (
          <Badge variant="destructive">
            Mark at least one correct answer
          </Badge>
        )}
      </div>

      {/* Existing Answers */}
      <div className="space-y-2">
        {value.map((answer, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 rounded-lg border p-3",
              answer.isCorrect && "border-green-500 bg-green-500/5"
            )}
          >
            {/* Order Controls */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => moveAnswer(index, "up")}
                disabled={index === 0}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveAnswer(index, "down")}
                disabled={index === value.length - 1}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Answer Text */}
            <Input
              value={answer.text}
              onChange={(e) => updateAnswer(index, { text: e.target.value })}
              placeholder="Answer text"
              className="flex-1"
            />

            {/* Correct Checkbox */}
            <label className="flex items-center gap-2 whitespace-nowrap">
              <input
                type="checkbox"
                checked={answer.isCorrect}
                onChange={(e) =>
                  updateAnswer(index, { isCorrect: e.target.checked })
                }
                className="h-4 w-4"
              />
              <span className="text-sm">Correct</span>
            </label>

            {/* Delete Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => deleteAnswer(index)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        ))}
      </div>

      {/* Add New Answer */}
      <div className="flex gap-2">
        <Input
          value={newAnswerText}
          onChange={(e) => setNewAnswerText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addAnswer();
            }
          }}
          placeholder="Add new answer option..."
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addAnswer}
          disabled={!newAnswerText.trim()}
        >
          Add
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No answer options yet. Add at least 2 options.
        </p>
      )}
    </div>
  );
}

