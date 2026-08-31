import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/product-grid";
import { Pagination } from "@/components/pagination";
import { getPublicProductsUseCase as getPublicProducts } from "@/use-cases/products";



export const metadata: Metadata = {
  title: "Акції та знижки",
  description: "Акційні пропозиції та знижки на запчастини для сільгосптехніки. Вигідні ціни на тракторні запчастини та підшипники.",
  alternates: {
    canonical: "/promotions",
  },
};

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
      <Suspense fallback={<PromotionsSkeleton />}>
        <PromotionsContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}

function PromotionsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <Skeleton className="h-6 w-1/4" />
      <div className="mt-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-32 mt-2" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function PromotionsContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParamsPromise;

  // Parse page
  let page = 1;
  const pageParam = resolvedSearchParams.page;
  if (pageParam && !Array.isArray(pageParam)) {
    const parsedPage = parseInt(pageParam, 10);
    if (!isNaN(parsedPage) && parsedPage > 0) page = parsedPage;
  }

  const result = await getPublicProducts({
    isPromotion: true,
    page,
    limit: 12,
  });

  const products = result.success && result.data ? result.data.products : [];
  const meta = result.success && result.data ? result.data.meta : { total: 0, totalPages: 0 };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Головна", href: "/" },
          { label: "Акції" },
        ]}
      />

      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Акції та знижки
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {meta.total} {meta.total === 1 ? "товар" : meta.total > 1 && meta.total < 5 ? "товари" : "товарів"}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {products.length > 0 ? (
          <>
            <ProductGrid products={products} />
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              baseUrl="/promotions"
              searchParams={resolvedSearchParams as Record<string, string | string[] | undefined>}
            />
          </>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            Наразі немає активних акцій
          </div>
        )}
      </div>
    </>
  );
}
