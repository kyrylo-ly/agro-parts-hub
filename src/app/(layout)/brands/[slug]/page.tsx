import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/product-grid";
import { Pagination } from "@/components/pagination";
import { getPublicBrandBySlug } from "@/services/brand-service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicBrandBySlug(slug);

  if (!result.success || !result.data || !("brand" in result.data)) {
    return { title: "Бренд не знайдено" };
  }

  const br = result.data.brand;
  return {
    title: br.name,
    description: `Запчастини ${br.name} — купити в інтернет-магазині Агро Літ. Доступні ціни, швидка доставка по Україні.`,
  };
}

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const instant = false;


export default function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
      <Suspense fallback={<BrandSkeleton />}>
        <BrandContent paramsPromise={params} searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}

function BrandSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-8 w-64 mt-4" />
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

async function BrandContent({
  paramsPromise,
  searchParamsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await paramsPromise;
  const resolvedSearchParams = await searchParamsPromise;
  const page =
    Number(
      Array.isArray(resolvedSearchParams.page)
        ? resolvedSearchParams.page[0]
        : resolvedSearchParams.page
    ) || 1;

  const sort =
    (resolvedSearchParams.sort as string) ?? "newest";

  const result = await getPublicBrandBySlug(slug, {
    page,
    sort: sort as "newest" | "price_asc" | "price_desc" | "bestsellers",
  });

  if (!result.success || !result.data || !("brand" in result.data)) {
    notFound();
  }

  const { brand: br, products, meta } = result.data;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Головна", href: "/" },
          { label: "Бренди", href: "/brands" },
          { label: br.name },
        ]}
      />

      <h1 className="mt-4 text-2xl font-bold tracking-tight lg:text-3xl">
        {br.name}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {meta.total} товарів
      </p>

      <div className="mt-8">
        <ProductGrid products={products} />
        <Pagination
          currentPage={page}
          totalPages={meta.totalPages}
          baseUrl={`/brands/${slug}`}
          searchParams={resolvedSearchParams as Record<string, string | string[] | undefined>}
        />
      </div>
    </>
  );
}
