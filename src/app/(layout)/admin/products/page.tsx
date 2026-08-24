import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminProducts } from "@/services/product-service";
import { ProductsTable } from "@/components/admin/products/products-table";
import { ProductSearch } from "@/components/admin/products/product-search";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page, search } = await searchParams;
  const currentPage = parseInt(page ?? "1", 10);

  const result = await getAdminProducts({
    page: currentPage,
    limit: 20,
    search: search ?? undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Продукти</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="size-4 mr-2" />
            Додати продукт
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <ProductSearch defaultValue={search ?? ""} />
      </div>

      {result.success ? (
        <ProductsTable
          products={result.data}
          meta={result.meta}
          currentSearch={search}
        />
      ) : (
        <p className="text-destructive">{result.error}</p>
      )}
    </div>
  );
}
