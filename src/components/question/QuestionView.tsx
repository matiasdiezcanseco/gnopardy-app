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
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        {category && (
          <p className="text-lg font-medium text-muted-foreground uppercase tracking-wider">
            {category.name}
          </p>
        )}
        <p className="text-3xl font-bold text-amber-500 sm:text-4xl">
          ${question.points}
        </p>
      </div>

      {/* Question Text */}
      <div
        className={cn(
          "rounded-xl bg-gradient-to-b from-blue-700 to-blue-900 p-6 sm:p-8",
          "border-2 border-blue-400/30 shadow-xl"
        )}
      >
        <p className="text-xl font-medium text-white text-center sm:text-2xl leading-relaxed">
          {question.text}
        </p>
      </div>

      {/* Media Content */}
      {question.mediaUrl && (
        <div className="mt-6">{renderMedia()}</div>
      )}
    </div>
  );
}

