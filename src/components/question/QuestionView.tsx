"use client";

import { AudioPlayer } from "./AudioPlayer";
import { VideoPlayer } from "./VideoPlayer";
import { ImageDisplay } from "./ImageDisplay";
import { cn } from "~/lib/utils";
import type { Question, Category } from "~/server/db/schema";

interface QuestionViewProps {
  question: Question;
  category?: Category | { id: number; name: string } | null;
  className?: string;
}

export function QuestionView({
  question,
  category,
  className,
}: QuestionViewProps) {
  const renderMedia = () => {
    if (!question.mediaUrl) return null;

    switch (question.type) {
      case "audio":
        return <AudioPlayer src={question.mediaUrl} />;
      case "video":
        return <VideoPlayer src={question.mediaUrl} />;
      case "image":
        return <ImageDisplay src={question.mediaUrl} alt="Question image" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        {category && (
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider sm:text-base md:text-lg">
            {category.name}
          </p>
        )}
        <p className="text-2xl font-bold text-primary sm:text-3xl md:text-4xl">
          ${question.points}
        </p>
      </div>

      {/* Question Text */}
      <div
        className={cn(
          "rounded-lg sm:rounded-xl bg-primary p-4 sm:p-6 md:p-8",
          "border-2 border-secondary shadow-xl"
        )}
      >
        <p className="text-lg font-medium text-primary-foreground text-center sm:text-xl md:text-2xl leading-relaxed break-words">
          {question.text}
        </p>
      </div>

      {/* Media Content */}
      {question.mediaUrl && (
        <div className="mt-4 sm:mt-6">{renderMedia()}</div>
      )}
    </div>
  );
}

