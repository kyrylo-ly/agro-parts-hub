"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/use-cart";
import dynamic from "next/dynamic";

const CartSheet = dynamic(() => import("./cart-sheet").then((mod) => mod.CartSheet), {
  ssr: false,
});

export function CartButton() {
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  return (
    <CartSheet>
      <Button
        variant="default"
        aria-label="Кошик"
        className="gap-2 rounded-full pl-3 pr-4 h-10 bg-primary/10 text-primary hover:bg-primary/20"
      >
        <div className="relative">
          <ShoppingCart className="size-5" />
          {count > 0 && (
            <span className="absolute -right-2 -top-2 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </div>
        <span className="hidden lg:inline text-sm font-semibold">Кошик</span>
      </Button>
    </CartSheet>
  );
}
