"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
}

export function AddToCartButton({ productId, productName }: AddToCartButtonProps) {
  function handleAddToCart() {
    // Read current cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]") as {
      productId: string;
      quantity: number;
    }[];

    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // Dispatch event so CartButton in header can update
    window.dispatchEvent(new CustomEvent("cart-updated"));

    toast.success(`${productName} додано до кошика`);
  }

  return (
    <Button
      size="icon"
      variant="outline"
      className="size-9 shrink-0 rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
      onClick={handleAddToCart}
      aria-label={`Додати ${productName} до кошика`}
    >
      <ShoppingCart className="size-4" />
    </Button>
  );
}
