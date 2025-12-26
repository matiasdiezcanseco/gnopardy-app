"use client";

import { cn } from "~/lib/utils";

export function SkipNavigation() {
  return (
    <>
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only",
          "fixed top-4 left-4 z-50",
          "bg-primary text-primary-foreground",
          "px-4 py-2 rounded-md",
          "font-medium text-sm",
          "focus:outline-none focus:ring-4 focus:ring-primary/50"
        )}
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className={cn(
          "sr-only focus:not-sr-only",
          "fixed top-4 left-40 z-50",
          "bg-primary text-primary-foreground",
          "px-4 py-2 rounded-md",
          "font-medium text-sm",
          "focus:outline-none focus:ring-4 focus:ring-primary/50"
        )}
      >
        Skip to navigation
      </a>
    </>
  );
}

