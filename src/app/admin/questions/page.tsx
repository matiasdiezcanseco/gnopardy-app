import Link from "next/link";
import { AdminQuestionsClient } from "./client";
import { getQuestions } from "~/server/actions/question";
import { getCategories } from "~/server/actions/category";
import { Button } from "~/components/ui/button";

export default async function AdminQuestionsPage() {
  const [questionsResult, categoriesResult] = await Promise.all([
    getQuestions(),
    getCategories(),
  ]);

  if (!questionsResult.success || !categoriesResult.success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950 p-8">
        <div className="container mx-auto">
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
            Failed to load data
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xl font-bold text-white hover:text-amber-400 transition-colors"
            >
              Jeopardy!
            </Link>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-lg font-semibold text-white">
              Manage Questions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/categories">
              <Button variant="outline" size="sm">
                Manage Categories
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <AdminQuestionsClient
          initialQuestions={questionsResult.data}
          categories={categoriesResult.data}
        />
      </main>
    </div>
  );
}

