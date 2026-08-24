"use client";

import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartActions } from "@/hooks/use-cart-actions";
import { cn } from "@/lib/utils";

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
  const { addToCart, isPending } = useCartActions();

  function handleAddToCart() {
    addToCart({
      id: productId,
      name: productName,
      price,
      slug,
      imageUrl
    });
  }

  return (
    <Button
      size="icon"
      variant="outline"
      className={cn(
        "shrink-0 rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors",
        className
      )}
      onClick={handleAddToCart}
      disabled={isPending}
      aria-label={`Додати ${productName} до кошика`}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <ShoppingCart className="size-4" />
      )}
    </Button>
  );
}
