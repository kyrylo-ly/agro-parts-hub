"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getProductsByIds } from "@/actions/public";

type CompareProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  attributes: Record<string, string> | null;
  brand: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
  images: { url: string }[];
};

export function ComparePageClient() {
  const [products, setProducts] = React.useState<CompareProduct[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      const ids = JSON.parse(
        localStorage.getItem("compare") || "[]"
      ) as string[];
      if (ids.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      const result = await getProductsByIds(ids, 4);
      if (result.success) {
        setProducts(result.data as CompareProduct[]);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  function removeFromCompare(productId: string) {
    const ids = JSON.parse(
      localStorage.getItem("compare") || "[]"
    ) as string[];
    const next = ids.filter((id) => id !== productId);
    localStorage.setItem("compare", JSON.stringify(next));
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    window.dispatchEvent(new CustomEvent("compare-updated"));
  }

  function clearAll() {
    localStorage.setItem("compare", "[]");
    setProducts([]);
    window.dispatchEvent(new CustomEvent("compare-updated"));
  }

  function formatPrice(price: string): string {
    return parseFloat(price).toLocaleString("uk-UA");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <p className="text-lg text-muted-foreground">
          Немає товарів для порівняння
        </p>
        <Button
          render={<Link href="/catalog" />}
          nativeButton={false}
        >
          Перейти до каталогу
        </Button>
      </div>
    );
  }

  // Collect all unique attribute keys
  const allAttrKeys = new Set<string>();
  for (const p of products) {
    if (p.attributes) {
      for (const key of Object.keys(p.attributes)) {
        allAttrKeys.add(key);
      }
    }
  }
  const attrKeys = Array.from(allAttrKeys);

  // Check if values differ for highlighting
  function valuesDiffer(values: (string | undefined)[]) {
    const defined = values.filter(Boolean);
    return defined.length > 1 && new Set(defined).size > 1;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive">
          <X className="mr-1 size-4" />
          Очистити все
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="w-40 bg-muted/30 p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Параметр
              </th>
              {products.map((p) => (
                <th key={p.id} className="min-w-[200px] p-4 text-center align-top">
                  <div className="relative group">
                    <button
                      onClick={() => removeFromCompare(p.id)}
                      className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label={`Видалити ${p.name}`}
                    >
                      <X className="size-3" />
                    </button>
                    <Link href={`/product/${p.slug}`} className="block">
                      <div className="mx-auto mb-3 relative size-28 overflow-hidden rounded-lg border bg-muted/10">
                        {p.images[0]?.url ? (
                          <Image
                            src={p.images[0].url}
                            alt={p.name}
                            fill
                            sizes="112px"
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="size-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-semibold line-clamp-2 hover:text-primary transition-colors">
                        {p.name}
                      </p>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price */}
            <tr className="border-t">
              <td className="bg-muted/30 p-4 text-sm font-medium text-muted-foreground">Ціна</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-center">
                  <span className="text-lg font-bold">{formatPrice(p.price)} ₴</span>
                  {p.compareAtPrice && parseFloat(p.compareAtPrice) > parseFloat(p.price) && (
                    <span className="ml-2 text-sm text-muted-foreground line-through">
                      {formatPrice(p.compareAtPrice)} ₴
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Stock */}
            <tr className="border-t bg-muted/10">
              <td className="bg-muted/30 p-4 text-sm font-medium text-muted-foreground">Наявність</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-center">
                  <Badge
                    variant={p.stock > 0 ? "default" : "destructive"}
                    className={p.stock > 0 ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10" : ""}
                  >
                    {p.stock > 0 ? "В наявності" : "Немає"}
                  </Badge>
                </td>
              ))}
            </tr>

            {/* SKU */}
            <tr className="border-t">
              <td className="bg-muted/30 p-4 text-sm font-medium text-muted-foreground">Артикул</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-center text-sm">{p.sku}</td>
              ))}
            </tr>

            {/* Brand */}
            <tr className="border-t bg-muted/10">
              <td className="bg-muted/30 p-4 text-sm font-medium text-muted-foreground">Бренд</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-center text-sm">
                  {p.brand ? (
                    <Link href={`/brands/${p.brand.slug}`} className="text-primary hover:underline">
                      {p.brand.name}
                    </Link>
                  ) : "—"}
                </td>
              ))}
            </tr>

            {/* Category */}
            <tr className="border-t">
              <td className="bg-muted/30 p-4 text-sm font-medium text-muted-foreground">Категорія</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-center text-sm">
                  {p.category ? (
                    <Link href={`/catalog/${p.category.slug}`} className="text-primary hover:underline">
                      {p.category.name}
                    </Link>
                  ) : "—"}
                </td>
              ))}
            </tr>

            {/* Dynamic attributes */}
            {attrKeys.map((key, idx) => {
              const values = products.map((p) => p.attributes?.[key]);
              const differ = valuesDiffer(values);
              return (
                <tr key={key} className={cn("border-t", idx % 2 === 0 ? "bg-muted/10" : "")}>
                  <td className="bg-muted/30 p-4 text-sm font-medium text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </td>
                  {values.map((val, i) => (
                    <td
                      key={products[i].id}
                      className={cn(
                        "p-4 text-center text-sm",
                        differ && val ? "font-semibold text-primary" : ""
                      )}
                    >
                      {val || "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
