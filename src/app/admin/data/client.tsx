"use client";

import { useRouter } from "next/navigation";
import { ImportExport } from "~/components/admin/ImportExport";
import type { Category } from "~/server/db/schema";

interface ImportExportClientProps {
  categories: Category[];
}

export function ImportExportClient({ categories }: ImportExportClientProps) {
  const router = useRouter();

  const handleImportComplete = () => {
    router.refresh();
  };

  return <ImportExport categories={categories} onImportComplete={handleImportComplete} />;
}

