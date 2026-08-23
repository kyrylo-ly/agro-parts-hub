import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/product-grid";
import { Pagination } from "@/components/pagination";
import { getPublicBrandBySlug } from "@/actions/public";
import { db } from "@/db/db";
import { brand } from "@/db/schema/store";

export const revalidate = 7200;

export async function generateStaticParams() {
  const brands = await db.select({ slug: brand.slug }).from(brand);
  return brands.map((b) => ({ slug: b.slug }));
}

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

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
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
    <div className="container mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
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
    </div>
  );
}
