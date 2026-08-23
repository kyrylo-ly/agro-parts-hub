"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCartStore } from "@/store/use-cart";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: string;
  slug: string;
  imageUrl?: string;
  className?: string;
}

export function AddToCartButton({ 
  productId, 
  productName, 
  price, 
  slug, 
  imageUrl,
  className = "size-9"
}: AddToCartButtonProps) {
  const { addItem } = useCartStore();

  function handleAddToCart() {
    addItem({
      id: productId,
      name: productName,
      price,
      slug,
      imageUrl
    });

    toast.success(`${productName} додано до кошика`);
  }

  return (
    <Button
      size="icon"
      variant="outline"
      className={`shrink-0 rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors ${className}`}
      onClick={handleAddToCart}
      aria-label={`Додати ${productName} до кошика`}
    >
      <ShoppingCart className="size-4" />
    </Button>
  );
}
