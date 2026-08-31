import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllCategoriesUseCase } from "@/use-cases/categories";
import { CategoriesTable } from "@/components/admin/categories/categories-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Категорії</h1>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="size-4 mr-2" />
            Додати категорію
          </Button>
        </Link>
      </div>

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

async function CategoriesContent() {
  const result = await getAllCategoriesUseCase();

  return (
    <>
      {result.success ? (
        <CategoriesTable categories={result.data} />
      ) : (
        <p className="text-destructive">{result.error}</p>
      )}
    </>
  );
}
