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
      <div className="bg-background flex min-h-screen items-center justify-center p-8">
        <div className="container mx-auto max-w-md">
          <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-6 text-center">
            <h3 className="mb-2 font-semibold">Error Loading Data</h3>
            <p>Failed to load questions or categories.</p>
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
    <div className="bg-background text-foreground min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="bg-card/50 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-primary hover:text-primary/80 text-xl font-bold transition-colors"
            >
              Gnopardy!
            </Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-foreground text-lg font-semibold">
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

      <main className="container mx-auto px-6 py-8">
        <AdminQuestionsClient
          initialQuestions={questionsWithAnswers}
          categories={categoriesResult.data}
        />
      </main>
    </div>
  );
}
