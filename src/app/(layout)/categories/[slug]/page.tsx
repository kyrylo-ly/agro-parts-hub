import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/product-grid";
import { Pagination } from "@/components/pagination";
import { CategoriesFilters } from "@/components/categories-filters";
import { getPublicCategoryBySlug } from "@/services/category-service";
import { getCategoryAttributeFilters } from "@/services/product-service";
import { getPublicBrands } from "@/services/brand-service";
import { type ProductFilterParams } from "@/services/types";
import { db } from "@/db/db";
import { category } from "@/db/schema/store";



export async function generateStaticParams() {
  const categories = await db
    .select({ slug: category.slug })
    .from(category);
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicCategoryBySlug(slug);

  if (!result.success || !("category" in result.data!)) {
    return { title: "Категорія не знайдена" };
  }

  const cat = result.data!.category;
  return {
    title: cat.name,
    description: `Купити ${cat.name.toLowerCase()} — запчастини для сільгосптехніки. Широкий вибір, доступні ціни, швидка доставка по Україні.`,
  };
}

function parseSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): ProductFilterParams {
  const get = (key: string): string | undefined => {
    const val = searchParams[key];
    return Array.isArray(val) ? val[0] : val;
  };

  const filters: ProductFilterParams = {};

  const brandStr = get("brand");
  if (brandStr) filters.brandSlugs = brandStr.split(",");

  const priceMin = get("price_min");
  if (priceMin) filters.priceMin = Number(priceMin);

  const priceMax = get("price_max");
  if (priceMax) filters.priceMax = Number(priceMax);

  if (get("in_stock") === "1") filters.inStock = true;

  const sort = get("sort");
  if (
    sort === "price_asc" ||
    sort === "price_desc" ||
    sort === "newest" ||
    sort === "bestsellers"
  ) {
    filters.sort = sort;
  }

  const page = get("page");
  if (page) filters.page = Number(page);

  // Dynamic attribute filters
  const attrs: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (key.startsWith("attr_") && value) {
      const attrKey = key.replace("attr_", "");
      const val = Array.isArray(value) ? value[0] : value;
      if (val) attrs[attrKey] = val.split(",");
    }
  }
  if (Object.keys(attrs).length > 0) filters.attributes = attrs;

  return filters;
}

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const instant = false;


export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryContent paramsPromise={params} searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <Skeleton className="h-6 w-1/3" />
      <div className="flex items-start justify-between gap-4 mt-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-24 lg:hidden" />
      </div>
      <div className="mt-6 flex gap-6">
        <div className="hidden lg:block w-64 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex-1 min-w-0">
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
    </div>
  );
}

async function CategoryContent({
  paramsPromise,
  searchParamsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const filters = parseSearchParams(searchParams);

  const result = await getPublicCategoryBySlug(slug, filters);

  if (!result.success || !result.data || !("category" in result.data)) {
    notFound();
  }

  const { category: cat, products, meta } = result.data;

  // Get filter data
  const [brandsResult, attributesResult] = await Promise.all([
    getPublicBrands([cat.id, ...(cat.children?.map(c => c.id) || [])]),
    getCategoryAttributeFilters(cat.id),
  ]);

  const brands = brandsResult.success
    ? brandsResult.data.filter((b) => b.productCount > 0)
    : [];
  const attributeFilters = attributesResult.success
    ? attributesResult.data
    : [];

  // Breadcrumbs
  const breadcrumbItems: { label: string; href?: string }[] = [
    { label: "Головна", href: "/" },
    { label: "Каталог", href: "/categories" },
  ];
  if (cat.parent) {
    breadcrumbItems.push({
      label: cat.parent.name,
      href: `/categories/${cat.parent.slug}`,
    });
  }
  breadcrumbItems.push({ label: cat.name });

  const currentPage = filters.page ?? 1;

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            {cat.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta.total}{" "}
            {meta.total === 1
              ? "товар"
              : meta.total < 5
                ? "товари"
                : "товарів"}
          </p>
        </div>

        {/* Mobile filters trigger */}
        <CategoriesFilters
          brands={brands}
          attributes={attributeFilters}
          basePath={`/categories/${slug}`}
          variant="mobile"
        />
      </div>

      {/* Subcategories */}
      {cat.children && cat.children.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {cat.children.map((sub) => (
            <a
              key={sub.id}
              href={`/categories/${sub.slug}`}
              className="rounded-full border bg-card px-4 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5"
            >
              {sub.name}
            </a>
          ))}
        </div>
      )}

      {/* Content: sidebar + grid */}
      <div className="mt-6 flex gap-6">
        {/* Desktop sidebar */}
        <CategoriesFilters
          brands={brands}
          attributes={attributeFilters}
          basePath={`/categories/${slug}`}
          variant="desktop"
        />

        {/* Products */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} />
          <Pagination
            currentPage={currentPage}
            totalPages={meta.totalPages}
            baseUrl={`/categories/${slug}`}
            searchParams={searchParams as Record<string, string | string[] | undefined>}
          />
        </div>
      </div>
    </>
  );
}
