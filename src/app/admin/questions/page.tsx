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
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="container mx-auto max-w-md">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-6 text-center">
            <h3 className="font-semibold mb-2">Error Loading Data</h3>
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Jeopardy!
            </Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-lg font-semibold text-foreground">
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
