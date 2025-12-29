import Link from "next/link";
import { getCategories } from "~/server/actions/category";
import { Button } from "~/components/ui/button";
import { ImportExportClient } from "./client";

export default async function AdminDataPage() {
  const categoriesResult = await getCategories();
  const categories = categoriesResult.success ? categoriesResult.data : [];

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
              Import / Export
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/categories">
              <Button variant="outline" size="sm">
                Manage Categories
              </Button>
            </Link>
            <Link href="/admin/questions">
              <Button variant="outline" size="sm">
                Manage Questions
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">
            Import & Export Data
          </h1>
          <p className="text-muted-foreground">
            Backup your game data or import questions from JSON files
          </p>
        </div>

        <ImportExportClient categories={categories} />
      </main>
    </div>
  );
}
