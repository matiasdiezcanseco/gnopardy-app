"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  exportGameData,
  exportCategoryData,
  importGameData,
  importGameDataMerge,
} from "~/server/actions/import-export";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import type { Category } from "~/server/db/schema";

interface ImportExportProps {
  categories?: Category[];
  onImportComplete?: () => void;
}

export function ImportExport({ categories, onImportComplete }: ImportExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState<"replace" | "merge">("merge");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (categoryId?: number) => {
    setIsExporting(true);
    setError(null);

    try {
      const result = categoryId
        ? await exportCategoryData(categoryId)
        : await exportGameData();

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Create and download JSON file
      const jsonString = JSON.stringify(result.data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jeopardy-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to export data");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      await handleImport(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async (jsonData: string) => {
    setIsImporting(true);
    setError(null);
    setImportResult(null);

    try {
      const result =
        importMode === "merge"
          ? await importGameDataMerge(jsonData)
          : await importGameData(jsonData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setImportResult(
        `Successfully imported ${result.data.categoriesCreated} categories and ${result.data.questionsCreated} questions!`
      );
      setShowImportDialog(false);

      // Refresh the page after import
      if (onImportComplete) {
        setTimeout(onImportComplete, 1500);
      }
    } catch (err) {
      setError("Failed to import data");
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export your categories, questions, and answers to a JSON file for
            backup or sharing.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleExport()}
              disabled={isExporting}
              variant="default"
            >
              {isExporting ? "Exporting..." : "📥 Export All Data"}
            </Button>

            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => handleExport(category.id)}
                    disabled={isExporting}
                    variant="outline"
                    size="sm"
                  >
                    Export "{category.name}"
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Import categories and questions from a JSON file.
          </p>

          <div className="space-y-3">
            {/* Import Mode Selection */}
            <div className="flex gap-2">
              <Button
                variant={importMode === "merge" ? "default" : "outline"}
                size="sm"
                onClick={() => setImportMode("merge")}
              >
                Merge (Keep Existing)
              </Button>
              <Button
                variant={importMode === "replace" ? "default" : "outline"}
                size="sm"
                onClick={() => setImportMode("replace")}
              >
                Replace (Import All)
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {importMode === "merge"
                ? "Skip categories/questions that already exist by name"
                : "Import all data as new entries (may create duplicates)"}
            </p>

            {/* File Input */}
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                disabled={isImporting}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {isImporting && (
            <Badge variant="secondary">Importing data, please wait...</Badge>
          )}
        </CardContent>
      </Card>

      {/* Success Message */}
      {importResult && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <p className="text-green-600 dark:text-green-400 font-medium">
              ✓ {importResult}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">✕ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Import Confirmation Dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Import</AlertDialogTitle>
            <AlertDialogDescription>
              {importMode === "merge"
                ? "This will import the data and skip any duplicates. Existing data will not be modified."
                : "This will import all data from the file. This may create duplicate categories and questions."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isImporting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isImporting}>
              {isImporting ? "Importing..." : "Import"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

