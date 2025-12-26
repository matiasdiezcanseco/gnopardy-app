import Link from "next/link";
import { AdminQuestionsClient } from "./client";
import { getQuestions } from "~/server/actions/question";
import { getCategories } from "~/server/actions/category";
import { getAnswersByQuestionId } from "~/server/actions/answer";
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
          <div className="bg-destructive/10 text-destructive rounded-lg p-4">
            Failed to load data
          </div>
        </div>
      </div>
    );
  }

  // Fetch answers for each question
  const questionsWithAnswers = await Promise.all(
    questionsResult.data.map(async (question) => {
      const answersResult = await getAnswersByQuestionId(question.id);
      return {
        ...question,
        answers: answersResult.success ? answersResult.data : [],
      };
    }),
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xl font-bold text-white transition-colors hover:text-amber-400"
            >
              Jeopardy!
            </Link>
            <span className="text-muted-foreground text-sm">/</span>
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
          initialQuestions={questionsWithAnswers}
          categories={categoriesResult.data}
        />
      </main>
    </div>
  );
}
