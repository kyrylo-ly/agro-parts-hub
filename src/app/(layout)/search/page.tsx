import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/product-grid";
import { Pagination } from "@/components/pagination";
import { searchProducts } from "@/services/product-service";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const q = Array.isArray(resolved.q) ? resolved.q[0] : resolved.q;

  return {
    title: q ? `Пошук: ${q}` : "Пошук",
    robots: { index: false, follow: true }, // search results are noindex
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const q = (Array.isArray(resolved.q) ? resolved.q[0] : resolved.q) ?? "";
  const page =
    Number(
      Array.isArray(resolved.page) ? resolved.page[0] : resolved.page
    ) || 1;

  const result = await searchProducts(q, { page });

  const products = result.success ? result.data.products : [];
  const meta = result.success
    ? result.data.meta
    : { total: 0, page: 1, limit: 12, totalPages: 0 };

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
      <Breadcrumbs
        items={[
          { label: "Головна", href: "/" },
          { label: "Пошук" },
        ]}
      />

      <h1 className="mt-4 text-2xl font-bold tracking-tight lg:text-3xl">
        {q ? `Результати пошуку: «${q}»` : "Пошук"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {meta.total}{" "}
        {meta.total === 1
          ? "товар"
          : meta.total < 5
            ? "товари"
            : "товарів"}
      </p>

      <div className="mt-8">
        {q.length < 2 ? (
          <p className="text-center text-muted-foreground py-16">
            Введіть мінімум 2 символи для пошуку
          </p>
        ) : (
          <>
            <ProductGrid products={products} />
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              baseUrl="/search"
              searchParams={resolved as Record<string, string | string[] | undefined>}
            />
          </>
        )}
      </div>
    </div>
  );
}
