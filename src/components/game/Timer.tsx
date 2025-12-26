"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface TimerProps {
  duration: number; // Duration in seconds
  onTimeUp?: () => void;
  autoStart?: boolean;
  showControls?: boolean;
  warningThreshold?: number; // Show warning at this many seconds
  criticalThreshold?: number; // Show critical warning at this many seconds
  className?: string;
}

export function Timer({
  duration,
  onTimeUp,
  autoStart = true,
  showControls = true,
  warningThreshold = 10,
  criticalThreshold = 5,
  className,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);

  // Calculate progress percentage
  const progressPercentage = (timeLeft / duration) * 100;

  // Determine status
  const getStatus = () => {
    if (timeLeft === 0) return "expired";
    if (timeLeft <= criticalThreshold) return "critical";
    if (timeLeft <= warningThreshold) return "warning";
    return "normal";
  };

  const status = getStatus();

  // Timer logic
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, onTimeUp]);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleReset = useCallback(() => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsPaused(false);
  }, [duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      className={cn(
        "p-6 transition-all duration-300",
        status === "critical" && "border-red-500 bg-red-500/10 animate-pulse",
        status === "warning" && "border-yellow-500 bg-yellow-500/10",
        status === "expired" && "border-gray-500 bg-gray-500/10",
        className
      )}
      role="timer"
      aria-label={`Timer: ${formatTime(timeLeft)} remaining`}
      aria-live="polite"
    >
      <div className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div
            className={cn(
              "text-6xl font-bold tabular-nums transition-colors",
              status === "critical" && "text-red-500",
              status === "warning" && "text-yellow-500",
              status === "expired" && "text-gray-500",
              status === "normal" && "text-foreground"
            )}
          >
            {formatTime(timeLeft)}
          </div>
          <div className="mt-2">
            <Badge
              variant={
                status === "critical" || status === "expired"
                  ? "destructive"
                  : status === "warning"
                  ? "secondary"
                  : "outline"
              }
            >
              {status === "expired"
                ? "Time's Up!"
                : status === "critical"
                ? "Hurry!"
                : status === "warning"
                ? "Running out of time"
                : "Active"}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-1000 ease-linear",
              status === "critical" && "bg-red-500",
              status === "warning" && "bg-yellow-500",
              status === "expired" && "bg-gray-500",
              status === "normal" && "bg-primary"
            )}
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={timeLeft}
            aria-valuemin={0}
            aria-valuemax={duration}
          />
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex justify-center gap-2">
            {!isRunning && timeLeft > 0 && (
              <Button
                onClick={handleStart}
                size="sm"
                variant="default"
                aria-label="Start timer"
              >
                Start
              </Button>
            )}
            {isRunning && !isPaused && (
              <Button
                onClick={handlePause}
                size="sm"
                variant="outline"
                aria-label="Pause timer"
              >
                Pause
              </Button>
            )}
            {isRunning && isPaused && (
              <Button
                onClick={handleResume}
                size="sm"
                variant="default"
                aria-label="Resume timer"
              >
                Resume
              </Button>
            )}
            <Button
              onClick={handleReset}
              size="sm"
              variant="secondary"
              aria-label="Reset timer"
            >
              Reset
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

interface TimerSettings {
  enabled: boolean;
  duration: number;
  autoStart: boolean;
}

export function useTimerSettings(): [
  TimerSettings,
  (settings: Partial<TimerSettings>) => void
] {
  const [settings, setSettingsState] = useState<TimerSettings>({
    enabled: false,
    duration: 30,
    autoStart: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("jeopardy-timer-settings");
    if (stored) {
      try {
        setSettingsState(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse timer settings", e);
      }
    }
  }, []);

  const setSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("jeopardy-timer-settings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return [settings, setSettings];
}

