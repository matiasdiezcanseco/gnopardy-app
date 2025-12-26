"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

interface TextAnswerInputProps {
  onSubmit: (answer: string) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function TextAnswerInput({
  onSubmit,
  isSubmitting = false,
  disabled = false,
  placeholder = "Type your answer...",
  className,
}: TextAnswerInputProps) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      setError("Please enter an answer");
      return;
    }

    onSubmit(trimmedAnswer);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("space-y-4", className)}
      aria-label="Answer submission form"
    >
      <div className="space-y-2">
        <label htmlFor="answer-input" className="sr-only">
          Your answer
        </label>
        <Input
          id="answer-input"
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSubmitting || disabled}
          className="text-base sm:text-lg py-4 sm:py-6 min-h-[48px]"
          autoFocus
          aria-label="Answer input"
          aria-describedby={error ? "answer-error" : undefined}
          aria-invalid={error ? "true" : "false"}
          autoComplete="off"
        />
        {error && (
          <p 
            className="text-sm text-destructive" 
            id="answer-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full min-h-[48px] text-base sm:text-lg"
        disabled={isSubmitting || disabled || !answer.trim()}
        aria-label={isSubmitting ? "Checking your answer" : "Submit your answer"}
      >
        {isSubmitting ? (
          <>
            <span 
              className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              role="status"
              aria-label="Loading"
            />
            Checking...
          </>
        ) : (
          "Submit Answer"
        )}
      </Button>
    </form>
  );
}

