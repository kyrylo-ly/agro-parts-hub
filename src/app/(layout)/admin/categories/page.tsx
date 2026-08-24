import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllCategories } from "@/services/category-service";
import { CategoriesTable } from "@/components/admin/categories/categories-table";

export default async function CategoriesPage() {
  const result = await getAllCategories();

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

      {result.success ? (
        <CategoriesTable categories={result.data} />
      ) : (
        <p className="text-destructive">{result.error}</p>
      )}
    </div>
  );
}
