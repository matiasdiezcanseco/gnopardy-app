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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <h1 className="text-xl font-bold text-white">Jeopardy!</h1>
            <nav className="flex items-center gap-2 sm:gap-4">
              <ThemeSwitcher />
              <Link
                href="/leaderboard"
                className="text-sm text-muted-foreground hover:text-white transition-colors"
              >
                Leaderboard
              </Link>
              <Link
                href="/history"
                className="text-sm text-muted-foreground hover:text-white transition-colors"
              >
                History
              </Link>
              <Link
                href="/statistics"
                className="text-sm text-muted-foreground hover:text-white transition-colors"
              >
                Stats
              </Link>
              <Link
                href="/admin/categories"
                className="text-sm text-muted-foreground hover:text-white transition-colors"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            {/* Logo/Title */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold tracking-tight text-white sm:text-7xl md:text-8xl">
                <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  JEOPARDY!
                </span>
              </h1>
              <p className="mt-4 text-xl text-white/60">
                The ultimate trivia game experience
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                onClick={handleNewGame}
                disabled={isPending}
                size="lg"
                className={cn(
                  "w-full sm:w-auto",
                  "bg-gradient-to-r from-amber-500 to-yellow-500",
                  "text-black font-bold",
                  "hover:from-amber-400 hover:to-yellow-400",
                  "shadow-lg shadow-amber-500/30",
                  "transition-all duration-200",
                  "hover:scale-105 hover:shadow-xl hover:shadow-amber-500/40"
                )}
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
              <div className="mt-16">
                <h2 className="mb-6 text-xl font-semibold text-white/80">
                  Continue Playing
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeGames.map((game) => (
                    <Link
                      key={game.id}
                      href={`/game/${game.id}`}
                      className={cn(
                        "group rounded-xl border border-white/10 bg-white/5 p-6",
                        "backdrop-blur transition-all duration-200",
                        "hover:border-amber-500/50 hover:bg-white/10",
                        "hover:shadow-lg hover:shadow-amber-500/10"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                            {game.name ?? `Game #${game.id}`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Started{" "}
                            {new Date(game.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5 text-muted-foreground group-hover:text-amber-400 transition-colors"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mt-24 grid gap-8 sm:grid-cols-3">
              <Link 
                href="/leaderboard"
                className="group text-center p-6 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-white/5 transition-all"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-8 w-8 text-blue-400"
                  >
                    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                  Leaderboard
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  View top players and rankings
                </p>
              </Link>

              <Link
                href="/history"
                className="group text-center p-6 rounded-xl border border-white/10 hover:border-amber-500/50 hover:bg-white/5 transition-all"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-8 w-8 text-amber-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                  Game History
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Review past games and scores
                </p>
              </Link>

              <Link
                href="/statistics"
                className="group text-center p-6 rounded-xl border border-white/10 hover:border-green-500/50 hover:bg-white/5 transition-all"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-8 w-8 text-green-400"
                  >
                    <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
                  Statistics
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Detailed player statistics
                </p>
              </Link>
            </div>

            {/* Admin Features */}
            <div className="mt-12 p-6 rounded-xl border border-white/10 bg-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">
                Admin Tools
              </h3>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/categories">
                  <Button variant="outline" size="sm">
                    📁 Manage Categories
                  </Button>
                </Link>
                <Link href="/admin/questions">
                  <Button variant="outline" size="sm">
                    ❓ Manage Questions
                  </Button>
                </Link>
                <Link href="/admin/data">
                  <Button variant="outline" size="sm">
                    💾 Import/Export Data
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur mt-auto">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>
              Built with Next.js, Tailwind CSS, and Drizzle ORM
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

