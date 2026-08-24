import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Truck,
  ShieldCheck,
  Headphones,
  RefreshCw,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

import { SectionHeader } from "@/components/section-header";
import { ProductGrid } from "@/components/product-grid";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getHomepageData } from "@/services/homepage-service";
import { Suspense } from "react";

export const revalidate = 7200;

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

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <Image
          src="/hero.avif"
          alt="Запчастини для сільгосптехніки"
          fill
          priority
          className="object-cover object-center -z-10"
          sizes="100vw"
        />
        {/* Dark overlay to make text readable against both dark and bright areas */}
        <div className="absolute inset-0 bg-black/30 -z-10" />

        <div className="relative z-10 container mx-auto max-w-[1400px] px-4 py-12 lg:px-8 lg:py-20">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl text-white drop-shadow-md">
              Запчастини для{" "}
              <span className="text-accent drop-shadow-lg">сільгосптехніки</span>
            </h1>
            <p className="text-lg text-white max-w-2xl sm:text-xl drop-shadow">
              Підшипники, фільтри, запчастини для тракторів МТЗ та іншої
              техніки. Великий асортимент, доступні ціни.
            </p>
            <Link
              href="/catalog"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full px-8 bg-accent text-accent-foreground hover:bg-accent/90 border-none"
              )}
            >
              Перейти до каталогу
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </div>
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

      {/* Categories Header - Static to prevent CLS */}
      <section className="container mx-auto max-w-[1400px] px-4 pt-10 lg:px-8 lg:pt-14">
        <SectionHeader
          title="Категорії"
          subtitle="Знайдіть потрібні запчастини"
          href="/catalog"
        />
      </section>

      <Suspense fallback={<HomepageSkeleton />}>
        <HomepageDynamicContent />
      </Suspense>
      {/* Trust Banner (Viber Expert) */}
      <section className="bg-primary text-primary-foreground border-y-4 border-accent my-6">
        <div className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight">
                Не знаєте номер деталі?
              </h2>
              <p className="text-lg text-primary-foreground/90 max-w-xl font-medium">
                Сфотографуйте зламану деталь, маркування або розміри та скиньте нам у Viber. Наш експерт підбере точний аналог за 5 хвилин!
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <a
                  href="viber://chat?number=%2B380000000000"
                  className={cn(buttonVariants({ size: "lg" }), "bg-[#5946D2] text-white hover:bg-[#4A3AB5] font-bold text-base px-8 uppercase")}
                >
                  <MessageCircle className="mr-2 size-5" />
                  Написати у Viber
                </a>
              </div>
            </div>
            <div className="flex-1 w-full flex justify-center md:justify-end">
              <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border-4 border-accent/20 bg-secondary flex items-center justify-center">
                <Image
                  src="/sklad.avif"
                  alt="Наш склад"
                  fill
                  sizes="(max-width: 768px) 100vw, 384px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

async function HomepageDynamicContent() {
  const { newArrivals: newArrivalsResult, bestsellers: bestsellersResult, categories: categoriesResult, collections: collectionsResult, brands: brandsResult } =
    await getHomepageData();

  const newArrivals = newArrivalsResult.success ? newArrivalsResult.data : [];
  const bestsellers = bestsellersResult.success ? bestsellersResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const collections = collectionsResult.success ? collectionsResult.data : [];
  const brands = brandsResult.success ? brandsResult.data : [];

  const topCategories = categories.filter((c) => !c.parent);

  return (
    <>
      {/* Categories Grid */}
      {topCategories.length > 0 && (
        <section className="container mx-auto max-w-[1400px] px-4 pb-10 lg:px-8 lg:pb-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {topCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog/${cat.slug}`}
                className="group relative flex h-36 sm:h-44 flex-col items-center justify-end overflow-hidden rounded-lg border bg-card text-center transition-all hover:border-primary hover:shadow-lg"
              >
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority={true}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Truck className="size-12 opacity-30" />
                  </div>
                )}

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />

                {/* Content */}
                <div className="relative z-10 w-full p-4">
                  <p className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-white line-clamp-2 drop-shadow-md">
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
    </>
  );
}

function HomepageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Categories Grid Skeleton */}
      <section className="container mx-auto max-w-[1400px] px-4 pb-10 lg:px-8 lg:pb-14">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 rounded-xl border bg-card p-4 lg:p-6"
            >
              <div className="size-14 rounded-xl bg-muted lg:size-16" />
              <div className="h-4 w-24 rounded bg-muted mt-1" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
