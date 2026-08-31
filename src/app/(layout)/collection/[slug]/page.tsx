import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/product-grid";
import { Pagination } from "@/components/pagination";
import { getCollectionBySlugWithProductsUseCase } from "@/use-cases/collections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCollectionBySlugWithProductsUseCase(slug);

  if (!result.success || !result.data || !("collection" in result.data)) {
    return { title: "Колекція не знайдена" };
  }

  const col = result.data.collection;
  return {
    title: col.title,
    description:
      col.description ||
      `${col.title} — добірка товарів в інтернет-магазині Агро Літ.`,
  };
}

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const instant = false;


export default function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
      <Suspense fallback={<CollectionSkeleton />}>
        <CollectionContent paramsPromise={params} searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}

function CollectionSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-8 w-64 mt-4" />
      <Skeleton className="h-4 w-96 mt-2" />
      <Skeleton className="h-4 w-32 mt-1" />
      <div className="mt-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function CollectionContent({
  paramsPromise,
  searchParamsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await paramsPromise;
  const resolvedSearchParams = await searchParamsPromise;
  const page = Number(
    Array.isArray(resolvedSearchParams.page)
      ? resolvedSearchParams.page[0]
      : resolvedSearchParams.page
  ) || 1;

  const result = await getCollectionBySlugWithProductsUseCase(slug, { page });

  if (!result.success || !result.data || !("collection" in result.data)) {
    notFound();
  }

  const { collection: col, products, meta } = result.data;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Головна", href: "/" },
          { label: col.title },
        ]}
      />

      <h1 className="mt-4 text-2xl font-bold tracking-tight lg:text-3xl">
        {col.title}
      </h1>
      {col.description && (
        <p className="mt-2 text-muted-foreground max-w-2xl">
          {col.description}
        </p>
      )}
      <p className="mt-1 text-sm text-muted-foreground">
        {meta.total} товарів
      </p>

      <div className="mt-8">
        <ProductGrid products={products} />
        <Pagination
          currentPage={page}
          totalPages={meta.totalPages}
          baseUrl={`/collection/${slug}`}
        />
      </div>
    </>
  );
}
