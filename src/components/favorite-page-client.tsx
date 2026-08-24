"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProductsByIds } from "@/actions/client";
import { ProductGrid } from "@/components/product-grid";

export function FavoritePageClient() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      const ids = JSON.parse(
        localStorage.getItem("favorites") || "[]"
      ) as string[];
      if (ids.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      const result = await getProductsByIds(ids);
      if (result.success) {
        setProducts(result.data as any[]);
      }
      setIsLoading(false);
    }
    load();

    const handleUpdate = () => {
      load();
    };

    window.addEventListener("favorites-updated", handleUpdate);
    return () => window.removeEventListener("favorites-updated", handleUpdate);
  }, []);

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
          У вас немає улюблених товарів
        </p>
        <Button
          render={<Link href="/categories" />}
          nativeButton={false}
        >
          Перейти до каталогу
        </Button>
      </div>
    );
  }

  return (
    <div>
      <ProductGrid products={products} />
    </div>
  );
}
