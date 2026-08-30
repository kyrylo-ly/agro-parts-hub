import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAllBrandsWithCountsUseCase } from "@/use-cases/brands";

export const metadata: Metadata = {
  title: "Бренди",
  description:
    "Бренди запчастин для сільськогосподарської техніки в інтернет-магазині Агро Літ.",
};

export default async function BrandsPage() {
  const result = await getAllBrandsWithCountsUseCase();
  const brands = result.success ? result.data : [];

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
      <Breadcrumbs
        items={[
          { label: "Головна", href: "/" },
          { label: "Бренди" },
        ]}
      />

      <h1 className="mt-4 text-2xl font-bold tracking-tight lg:text-3xl">
        Бренди
      </h1>
      <p className="mt-2 text-muted-foreground">
        {brands.length} виробників
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {brands.map((br) => (
          <Link
            key={br.id}
            href={`/brands/${br.slug}`}
            className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-5 text-center transition-all hover:border-primary/30 hover:shadow-md"
          >
            <span className="text-base font-semibold group-hover:text-primary transition-colors">
              {br.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {br.productCount} товарів
            </span>
          </Link>
        ))}
      </div>

      {brands.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          Брендів поки немає
        </p>
      )}
    </div>
  );
}
