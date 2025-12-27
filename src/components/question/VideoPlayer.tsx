"use client";

import { useState, useRef } from "react";
import { cn } from "~/lib/utils";

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  className?: string;
}

export function VideoPlayer({
  src,
  autoPlay = false,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError("Failed to load video");
    setIsLoading(false);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-4 text-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-xl overflow-hidden shadow-lg", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-muted-foreground">Loading video...</span>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        controls
        className="w-full aspect-video bg-black"
        onCanPlay={handleCanPlay}
        onLoadedData={handleCanPlay}
        onError={handleError}
        preload="auto"
      />

      {/* Fullscreen Button */}
      {!isLoading && (
        <button
          onClick={handleFullscreen}
          className="absolute bottom-16 right-4 rounded-lg bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          aria-label="Toggle fullscreen"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M15 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.56l-3.97 3.97a.75.75 0 11-1.06-1.06l3.97-3.97h-2.69a.75.75 0 01-.75-.75zm-12 0A.75.75 0 013.75 3h4.5a.75.75 0 010 1.5H5.56l3.97 3.97a.75.75 0 01-1.06 1.06L4.5 5.56v2.69a.75.75 0 01-1.5 0v-4.5zm11.47 11.78a.75.75 0 111.06-1.06l3.97 3.97v-2.69a.75.75 0 011.5 0v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 010-1.5h2.69l-3.97-3.97zm-4.94-1.06a.75.75 0 010 1.06L5.56 19.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v2.69l3.97-3.97a.75.75 0 011.06 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

