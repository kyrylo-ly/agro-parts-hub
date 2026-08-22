import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/product-grid";
import { Pagination } from "@/components/pagination";
import { getPublicCollectionBySlug } from "@/actions/public";
import { db } from "@/db/db";
import { collection } from "@/db/schema/store";

export const revalidate = 600;

export async function generateStaticParams() {
  const collections = await db
    .select({ slug: collection.slug })
    .from(collection);
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicCollectionBySlug(slug);

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

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Number(
    Array.isArray(resolvedSearchParams.page)
      ? resolvedSearchParams.page[0]
      : resolvedSearchParams.page
  ) || 1;

  const result = await getPublicCollectionBySlug(slug, { page });

  if (!result.success || !result.data || !("collection" in result.data)) {
    notFound();
  }

  const { collection: col, products, meta } = result.data;

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
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
    </div>
  );
}
