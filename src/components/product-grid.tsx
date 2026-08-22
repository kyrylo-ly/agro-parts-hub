import { ProductCard } from "@/components/product-card";

interface ProductGridProps {
  products: {
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
  }[];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = "Товарів не знайдено",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
