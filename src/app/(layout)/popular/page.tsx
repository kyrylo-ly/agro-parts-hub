import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/product-grid";
import { Pagination } from "@/components/pagination";
import { getPublicProducts } from "@/actions/public";

export const revalidate = 7200;

export const metadata: Metadata = {
  title: "Найпопулярніші товари | Агро Літ",
  description: "Найпопулярніші товари за кількістю переглядів. Топ запчастин для сільгосптехніки та тракторів.",
  alternates: {
    canonical: "/popular",
  },
};

export default async function PopularPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;

  // Parse page
  let page = 1;
  const pageParam = resolvedSearchParams.page;
  if (pageParam && !Array.isArray(pageParam)) {
    const parsedPage = parseInt(pageParam, 10);
    if (!isNaN(parsedPage) && parsedPage > 0) page = parsedPage;
  }

  const result = await getPublicProducts({
    sort: "popular",
    page,
    limit: 12,
  });

  const products = result.success && result.data ? result.data.products : [];
  const meta = result.success && result.data ? result.data.meta : { total: 0, totalPages: 0 };

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
      <Breadcrumbs
        items={[
          { label: "Головна", href: "/" },
          { label: "Найпопулярніші" },
        ]}
      />

      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Найпопулярніші товари
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
              baseUrl="/popular"
              searchParams={resolvedSearchParams as Record<string, string | string[] | undefined>}
            />
          </>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            Наразі немає товарів
          </div>
        )}
      </div>
    </div>
  );
}
