import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CompareButton } from "@/components/compare-button";
import { FavoriteButton } from "@/components/favorite-button";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: string;
    compareAtPrice: string | null;
    stock: number;
    createdAt: Date;
    brand: { name: string; slug: string } | null;
    images: { url: string }[];
  };
}

import { isNewProduct, calculateDiscount, formatPrice } from "@/lib/domain/product";

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.compareAtPrice !== null &&
    product.compareAtPrice !== "" &&
    parseFloat(product.compareAtPrice) > parseFloat(product.price);
  const discount = hasDiscount
    ? calculateDiscount(product.price, product.compareAtPrice!)
    : 0;
  const isNew = isNewProduct(product.createdAt);
  const inStock = product.stock > 0;
  const imageUrl = product.images[0]?.url;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      {/* Badges */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        {hasDiscount && discount > 0 && (
          <Badge className="bg-red-600 text-white hover:bg-red-700 text-xs font-semibold px-2 py-0.5">
            -{discount}%
          </Badge>
        )}
        {isNew && (
          <Badge className="bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold px-2 py-0.5">
            Новинка
          </Badge>
        )}
      </div>

      {/* Top Right Actions */}
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-background/60 backdrop-blur-md p-1 rounded-xl border shadow-sm">
        <FavoriteButton
          productId={product.id}
          productName={product.name}
        />
        <CompareButton
          productId={product.id}
          productName={product.name}
        />
      </div>

      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-muted/30"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="size-12 text-muted-foreground/30" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        {/* Brand */}
        {product.brand && (
          <Link
            href={`/brands/${product.brand.slug}`}
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-primary transition-colors truncate"
          >
            {product.brand.name}
          </Link>
        )}

        {/* Name */}
        <Link
          href={`/product/${product.slug}`}
          className="text-sm font-medium leading-snug line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]"
        >
          {product.name}
        </Link>

        {/* SKU */}
        <p className="text-xs text-muted-foreground">
          Код: {product.sku}
        </p>

        {/* Stock status */}
        <p
          className={cn(
            "text-xs font-medium",
            inStock ? "text-emerald-700" : "text-red-600"
          )}
        >
          {inStock ? "В наявності" : "Немає в наявності"}
        </p>

        {/* Price + Cart */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col min-w-0">
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through truncate">
                {formatPrice(product.compareAtPrice!)} ₴
              </span>
            )}
            <span
              className={cn(
                "text-lg font-bold truncate",
                hasDiscount ? "text-red-600" : "text-foreground"
              )}
            >
              {formatPrice(product.price)} ₴
            </span>
          </div>
          <div className="shrink-0">
            {inStock && (
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                price={product.price}
                slug={product.slug}
                imageUrl={imageUrl}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
