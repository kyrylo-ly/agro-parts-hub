import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { getPublicProductBySlug } from "@/actions/public";
import { db } from "@/db/db";
import { product } from "@/db/schema/store";
import { eq, desc } from "drizzle-orm";
import { cn } from "@/lib/utils";

export const revalidate = 1200;

export async function generateStaticParams() {
  // Pre-render top 100 most viewed products
  const products = await db
    .select({ slug: product.slug })
    .from(product)
    .where(eq(product.isActive, true))
    .orderBy(desc(product.viewCount))
    .limit(100);
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicProductBySlug(slug);

  if (!result.success) {
    return { title: "Товар не знайдено" };
  }

  const p = result.data;
  const imageUrl = p.images[0]?.url;

  return {
    title: p.name,
    description:
      p.description ||
      `${p.name} — купити в інтернет-магазині Агро Літ. ${p.brand?.name ?? ""} ${p.sku}. Доступні ціни, швидка доставка.`,
    openGraph: {
      title: p.name,
      description: p.description || undefined,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  };
}

function formatPrice(price: string): string {
  return parseFloat(price).toLocaleString("uk-UA");
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublicProductBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const p = result.data;
  const hasDiscount =
    p.compareAtPrice !== null &&
    p.compareAtPrice !== "" &&
    parseFloat(p.compareAtPrice) > parseFloat(p.price);
  const discount = hasDiscount
    ? Math.round(
      ((parseFloat(p.compareAtPrice!) - parseFloat(p.price)) /
        parseFloat(p.compareAtPrice!)) *
      100
    )
    : 0;
  const inStock = p.stock > 0;
  const attributes = (p.attributes as Record<string, string>) || {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  // Breadcrumbs
  const breadcrumbItems: { label: string; href?: string }[] = [
    { label: "Головна", href: "/" },
    { label: "Каталог", href: "/catalog" },
  ];
  if (p.category) {
    if (p.category.parent) {
      breadcrumbItems.push({
        label: p.category.parent.name,
        href: `/catalog/${p.category.parent.slug}`,
      });
    }
    breadcrumbItems.push({
      label: p.category.name,
      href: `/catalog/${p.category.slug}`,
    });
  }
  breadcrumbItems.push({ label: p.name });

  // JSON-LD Product schema
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    sku: p.sku,
    image: p.images.map((img) => img.url),
    brand: p.brand
      ? {
        "@type": "Brand",
        name: p.brand.name,
      }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${p.slug}`,
      priceCurrency: "UAH",
      price: p.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="container mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Product Layout */}
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Gallery */}
          <ProductGallery images={p.images} productName={p.name} />

          {/* Right: Info */}
          <div className="flex flex-col gap-4">
            {/* Brand */}
            {p.brand && (
              <Link
                href={`/brands/${p.brand.slug}`}
                className="text-sm font-medium uppercase tracking-wider text-primary hover:underline w-fit"
              >
                {p.brand.name}
              </Link>
            )}

            {/* Name */}
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {p.name}
            </h1>

            {/* SKU + Stock */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Артикул: {p.sku}
              </span>
              <Badge
                variant={inStock ? "default" : "destructive"}
                className={cn(
                  inStock
                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10"
                    : ""
                )}
              >
                {inStock ? "В наявності" : "Немає в наявності"}
              </Badge>
              {hasDiscount && discount > 0 && (
                <Badge className="bg-red-500 text-white hover:bg-red-500">
                  -{discount}%
                </Badge>
              )}
            </div>

            <Separator />

            {/* Price */}
            <div className="flex items-end gap-3">
              <span
                className={cn(
                  "text-3xl font-bold",
                  hasDiscount ? "text-red-600" : "text-foreground"
                )}
              >
                {formatPrice(p.price)} ₴
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(p.compareAtPrice!)} ₴
                </span>
              )}
            </div>

            {/* Actions */}
            {inStock && (
              <div className="flex flex-wrap gap-3 mt-2">
                <AddToCartButton productId={p.id} productName={p.name} />
                <Button variant="outline" className="gap-2 rounded-lg flex-1 sm:flex-none">
                  <Zap className="size-4" />
                  Замовлення в 1 клік
                </Button>
              </div>
            )}

            <Separator />

            {/* Quick specs */}
            {Object.keys(attributes).length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Основні характеристики
                </h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(attributes)
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <div key={key} className="contents">
                        <dt className="text-sm text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </dt>
                        <dd className="text-sm font-medium">{value}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Tabs: Description + Full Specs */}
        <div className="mt-10">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Опис
              </TabsTrigger>
              {Object.keys(attributes).length > 0 && (
                <TabsTrigger
                  value="specs"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  Характеристики
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="description" className="pt-6">
              {p.description ? (
                <div className="prose max-w-none text-muted-foreground">
                  <p>{p.description}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Опис товару відсутній.
                </p>
              )}
            </TabsContent>

            {Object.keys(attributes).length > 0 && (
              <TabsContent value="specs" className="pt-6">
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(attributes).map(
                        ([key, value], idx) => (
                          <tr
                            key={key}
                            className={cn(
                              idx % 2 === 0 ? "bg-muted/30" : "bg-background"
                            )}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-muted-foreground w-1/3 capitalize">
                              {key.replace(/_/g, " ")}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {value}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
}
