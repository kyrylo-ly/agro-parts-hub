import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminProducts } from "@/services/product-service";
import { ProductsTable } from "@/components/admin/products/products-table";
import { ProductSearch } from "@/components/admin/products/product-search";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
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

      <Suspense fallback={<AdminProductsSkeleton />}>
        <AdminProductsContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}

function AdminProductsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="border rounded-lg p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function AdminProductsContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ page?: string; search?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const { page, search } = searchParams;
  const currentPage = parseInt(page ?? "1", 10);

  const result = await getAdminProducts({
    page: currentPage,
    limit: 20,
    search: search ?? undefined,
  });

  return (
    <>
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
    </>
  );
}
