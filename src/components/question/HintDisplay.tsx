"use client";

import { AudioPlayer } from "./AudioPlayer";
import { VideoPlayer } from "./VideoPlayer";
import { ImageDisplay } from "./ImageDisplay";
import { cn } from "~/lib/utils";
import type { QuestionHint } from "~/server/db/schema";

interface HintDisplayProps {
  hint: QuestionHint;
  hintNumber: number;
  className?: string;
}

export function HintDisplay({
  hint,
  hintNumber,
  className,
}: HintDisplayProps) {
  const renderHintMedia = () => {
    switch (hint.type) {
      case "audio":
        return hint.mediaUrl ? <AudioPlayer src={hint.mediaUrl} /> : null;
      case "video":
        return hint.mediaUrl ? <VideoPlayer src={hint.mediaUrl} /> : null;
      case "image":
        return hint.mediaUrl ? (
          <ImageDisplay src={hint.mediaUrl} alt={`Hint ${hintNumber}`} />
        ) : null;
      case "text":
        return (
          <p className="text-base text-foreground leading-relaxed">
            {hint.textContent}
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border-2 border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-md",
        "animate-in slide-in-from-top-2 duration-300",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-sm">
          {hintNumber}
        </div>
        <h4 className="font-semibold text-amber-900 dark:text-amber-100">
          Hint {hintNumber}
          {hint.description && ` - ${hint.description}`}
        </h4>
      </div>
      <div className="mt-2">{renderHintMedia()}</div>
    </div>
  );
}

