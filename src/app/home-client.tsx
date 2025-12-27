"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { createGame } from "~/server/actions/game";
import { ThemeSwitcher } from "~/components/layout/ThemeSwitcher";
import { cn } from "~/lib/utils";
import type { Game } from "~/server/db/schema";

interface HomePageClientProps {
  activeGames: Game[];
}

export function HomePageClient({ activeGames }: HomePageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleNewGame = () => {
    setError(null);
    startTransition(async () => {
      const result = await createGame({
        name: `Game ${new Date().toLocaleDateString()}`,
        status: "active",
      });

      if (result.success) {
        router.push(`/game/${result.data.id}`);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="relative">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <h1 className="text-xl font-bold tracking-tight text-primary">Jeopardy!</h1>
            <nav className="flex items-center gap-4 sm:gap-6">
              <ThemeSwitcher />
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Leaderboard
              </Link>
              <Link
                href="/history"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                History
              </Link>
              <Link
                href="/statistics"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Stats
              </Link>
              <Link
                href="/admin/categories"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            {/* Logo/Title */}
            <div className="mb-12">
              <h1 className="text-6xl font-bold tracking-tight text-primary sm:text-7xl md:text-8xl drop-shadow-sm">
                JEOPARDY!
              </h1>
              <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
                The ultimate trivia game experience. Challenge your friends and test your knowledge.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                onClick={handleNewGame}
                disabled={isPending}
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                {isPending ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating Game...
                  </>
                ) : (
                  "Start New Game"
                )}
              </Button>
            </div>

            {error && (
              <p className="mt-4 text-sm text-destructive">{error}</p>
            )}

            {/* Active Games */}
            {activeGames.length > 0 && (
              <div className="mt-20">
                <h2 className="mb-8 text-2xl font-semibold text-foreground">
                  Continue Playing
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {activeGames.map((game) => (
                    <Link
                      key={game.id}
                      href={`/game/${game.id}`}
                      className={cn(
                        "group rounded-xl border bg-card p-6",
                        "transition-all duration-200",
                        "hover:border-primary/50 hover:shadow-md",
                        "text-left"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {game.name ?? `Game #${game.id}`}
                        </h3>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Started {new Date(game.createdAt).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mt-24 grid gap-8 sm:grid-cols-3">
              <Link 
                href="/leaderboard"
                className="group text-center p-8 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-8 w-8"
                  >
                    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  Leaderboard
                </h3>
                <p className="text-muted-foreground">
                  View top players and rankings
                </p>
              </Link>

              <Link
                href="/history"
                className="group text-center p-8 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-8 w-8"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  Game History
                </h3>
                <p className="text-muted-foreground">
                  Review past games and scores
                </p>
              </Link>

              <Link
                href="/statistics"
                className="group text-center p-8 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-8 w-8"
                  >
                    <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  Statistics
                </h3>
                <p className="text-muted-foreground">
                  Detailed player statistics
                </p>
              </Link>
            </div>

            {/* Admin Features */}
            <div className="mt-16 p-8 rounded-xl border bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Admin Tools
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/admin/categories">
                  <Button variant="outline">
                    📁 Manage Categories
                  </Button>
                </Link>
                <Link href="/admin/questions">
                  <Button variant="outline">
                    ❓ Manage Questions
                  </Button>
                </Link>
                <Link href="/admin/data">
                  <Button variant="outline">
                    💾 Import/Export Data
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-card/50 backdrop-blur mt-auto">
          <div className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
            <p>
              Built with Next.js, Tailwind CSS, and Drizzle ORM
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
