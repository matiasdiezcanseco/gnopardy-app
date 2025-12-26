"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "~/lib/utils";

interface ImageDisplayProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ImageDisplay({
  src,
  alt = "Question image",
  className,
}: ImageDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError("Failed to load image");
    setIsLoading(false);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-4 text-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Main Image */}
      <div
        className={cn(
          "relative rounded-xl overflow-hidden shadow-lg cursor-zoom-in",
          className
        )}
        onClick={toggleZoom}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        <div className="relative aspect-video">
          <Image
            src={src}
            alt={alt}
            fill
            className={cn(
              "object-contain transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={handleLoad}
            onError={handleError}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
          />
        </div>

        {/* Zoom hint */}
        <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          Click to zoom
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-zoom-out"
          onClick={toggleZoom}
        >
          <button
            onClick={toggleZoom}
            className="absolute top-4 right-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            aria-label="Close fullscreen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <div className="relative max-h-[90vh] max-w-[90vw]">
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={800}
              className="object-contain max-h-[90vh]"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </>
  );
}

