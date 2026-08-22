"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartButton() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    function updateCount() {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]") as {
          productId: string;
          quantity: number;
        }[];
        setCount(cart.reduce((sum, item) => sum + item.quantity, 0));
      } catch {
        setCount(0);
      }
    }

    updateCount();
    window.addEventListener("cart-updated", updateCount);
    return () => window.removeEventListener("cart-updated", updateCount);
  }, []);

  return (
    <Button
      variant="default"
      className="gap-2 rounded-full pl-3 pr-4 h-10 bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
    >
      <div className="relative">
        <ShoppingCart className="size-5" />
        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground dark:bg-background dark:text-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </div>
      <span className="hidden lg:inline text-sm font-semibold">Кошик</span>
    </Button>
  );
}
