import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Truck,
  ShieldCheck,
  Headphones,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

import { SectionHeader } from "@/components/section-header";
import { ProductGrid } from "@/components/product-grid";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getNewArrivals,
  getBestsellers,
  getPopularProducts,
  getPublicCategories,
  getPublicCollections,
  getPublicBrands,
} from "@/actions/public";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export const metadata: Metadata = {
  title: "Агро Літ — Запчастини для тракторів та сільгосптехніки",
  description:
    "Інтернет-магазин запчастин для тракторів МТЗ, підшипників та сільськогосподарської техніки. Великий асортимент, доступні ціни, швидка доставка по Україні.",
};

const benefits = [
  {
    icon: Truck,
    title: "Швидка доставка",
    description: "Нова Пошта по всій Україні",
  },
  {
    icon: ShieldCheck,
    title: "Гарантія якості",
    description: "Оригінальні запчастини",
  },
  {
    icon: RefreshCw,
    title: "Обмін та повернення",
    description: "Протягом 14 днів",
  },
  {
    icon: Headphones,
    title: "Підтримка",
    description: "Консультація спеціалістів",
  },
];

export default async function Home() {
  const [
    newArrivalsResult,
    bestsellersResult,
    popularResult,
    categoriesResult,
    collectionsResult,
    brandsResult,
  ] = await Promise.all([
    getNewArrivals(8),
    getBestsellers(8),
    getPopularProducts(8),
    getPublicCategories(),
    getPublicCollections(),
    getPublicBrands(),
  ]);

  const newArrivals = newArrivalsResult.success ? newArrivalsResult.data : [];
  const bestsellers = bestsellersResult.success ? bestsellersResult.data : [];
  const popular = popularResult.success ? popularResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const collections = collectionsResult.success ? collectionsResult.data : [];
  const brands = brandsResult.success ? brandsResult.data : [];

  const topCategories = categories.filter((c) => !c.parent);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="relative z-10 container mx-auto max-w-[1400px] px-4 py-12 lg:px-8 lg:py-20">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
              Запчастини для{" "}
              <span className="text-primary">сільгосптехніки</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl sm:text-xl">
              Підшипники, фільтри, запчастини для тракторів МТЗ та іншої
              техніки. Великий асортимент, доступні ціни.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/catalog"
                className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8")}
              >
                Перейти до каталогу
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href="/brands"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "rounded-full px-8")}
              >
                Бренди
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Benefits Bar */}
      <section className="border-y bg-muted/20">
        <div className="container mx-auto max-w-[1400px] px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-0 lg:py-0 lg:divide-x">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="flex items-center gap-3 px-4 lg:px-6 lg:py-5"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary lg:size-12">
                    <Icon className="size-5 lg:size-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {benefit.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      {topCategories.length > 0 && (
        <section className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
          <SectionHeader
            title="Категорії"
            subtitle="Знайдіть потрібні запчастини"
            href="/catalog"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {topCategories.map((cat) => (
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
                  <p className="text-sm font-semibold line-clamp-2">
                    {cat.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
          <SectionHeader
            title="Новинки"
            subtitle="Нещодавно додані товари"
            href="/new"
          />
          <ProductGrid products={newArrivals} />
        </section>
      )}

      {/* Collections Banner */}
      {collections.length > 0 && (
        <section className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
          <SectionHeader title="Колекції" subtitle="Спеціальні добірки" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.slice(0, 3).map((col) => (
              <Link
                key={col.id}
                href={`/collection/${col.slug}`}
                className="group relative flex flex-col justify-end overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 to-primary/15 p-6 transition-all hover:shadow-lg min-h-[160px] lg:min-h-[200px]"
              >
                <h3 className="text-lg font-bold">{col.title}</h3>
                {col.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {col.description}
                  </p>
                )}
                <p className="mt-2 text-xs font-medium text-primary">
                  {col.productCount}{" "}
                  {col.productCount === 1
                    ? "товар"
                    : col.productCount < 5
                      ? "товари"
                      : "товарів"}{" "}
                  →
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="bg-muted/20">
          <div className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
            <SectionHeader
              title="Хіти продажу"
              subtitle="Найпопулярніші товари"
              href="/bestsellers"
            />
            <ProductGrid products={bestsellers} />
          </div>
        </section>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <section className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
          <SectionHeader
            title="Бренди"
            subtitle="Перевірені виробники"
            href="/brands"
          />
          <div className="flex flex-wrap gap-3">
            {brands.slice(0, 12).map((br) => (
              <Link
                key={br.id}
                href={`/brands/${br.slug}`}
                className="rounded-lg border bg-card px-5 py-3 text-sm font-medium transition-all hover:border-primary/30 hover:shadow-sm"
              >
                {br.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Products */}
      {popular.length > 0 && (
        <section className="bg-muted/20">
          <div className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
            <SectionHeader
              title="Популярні товари"
              subtitle="За кількістю переглядів"
              href="/popular"
            />
            <ProductGrid products={popular} />
          </div>
        </section>
      )}
    </>
  );
}
