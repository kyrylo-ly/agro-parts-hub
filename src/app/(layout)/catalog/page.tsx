import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Truck } from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { getPublicCategories } from "@/actions/public";

export const metadata: Metadata = {
  title: "Каталог запчастин",
  description:
    "Повний каталог запчастин для тракторів та сільськогосподарської техніки. Підшипники, фільтри, запчастини для двигунів.",
};

export default async function CatalogPage() {
  const result = await getPublicCategories();
  const categories = result.success ? result.data : [];
  const topCategories = categories.filter((c) => !c.parent);

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
      <Breadcrumbs
        items={[
          { label: "Головна", href: "/" },
          { label: "Каталог" },
        ]}
      />

      <h1 className="mt-4 text-2xl font-bold tracking-tight lg:text-3xl">
        Каталог товарів
      </h1>
      <p className="mt-2 text-muted-foreground">
        {categories.length}{" "}
        {categories.length === 1 ? "категорія" : "категорій"}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {topCategories.map((cat) => {
          const childCategories = categories.filter(
            (c) => c.parent?.id === cat.id
          );

          return (
            <Link
              key={cat.id}
              href={`/catalog/${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center transition-all hover:border-primary/30 hover:shadow-md lg:p-6"
            >
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary overflow-hidden transition-colors group-hover:bg-primary group-hover:text-primary-foreground lg:size-16">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    width={64}
                    height={64}
                    className="size-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <Truck className="size-7 lg:size-8" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold line-clamp-2">{cat.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {cat.productCount} товарів
                </p>
                {childCategories.length > 0 && (
                  <p className="mt-1 text-xs text-primary">
                    {childCategories.length} підкатегорій
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
