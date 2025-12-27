import Link from "next/link";
import { AdminCategoriesClient } from "./client";
import { getCategories } from "~/server/actions/category";
import { Button } from "~/components/ui/button";

export default async function AdminCategoriesPage() {
  const result = await getCategories();

  if (!result.success) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="container mx-auto max-w-md">
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-6 text-destructive text-center">
            <h3 className="font-semibold mb-2">Error Loading Data</h3>
            <p>Failed to load categories: {result.error}</p>
          </div>
        </div>
      </div>
    );
  }

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
              Manage Categories
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/questions">
              <Button variant="outline" size="sm">
                Manage Questions
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <AdminCategoriesClient initialCategories={result.data} />
      </main>
    </div>
  );
}

