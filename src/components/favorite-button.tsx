"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as React from "react";

interface FavoriteButtonProps {
  productId: string;
  productName: string;
}

export function FavoriteButton({ productId, productName }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    function check() {
      const ids = JSON.parse(localStorage.getItem("favorites") || "[]") as string[];
      setIsFavorite(ids.includes(productId));
    }
    check();
    window.addEventListener("favorites-updated", check);
    return () => window.removeEventListener("favorites-updated", check);
  }, [productId]);

  function handleToggle() {
    const ids = JSON.parse(localStorage.getItem("favorites") || "[]") as string[];

    if (ids.includes(productId)) {
      const next = ids.filter((id) => id !== productId);
      localStorage.setItem("favorites", JSON.stringify(next));
      setIsFavorite(false);
      toast.info(`${productName} видалено з улюбленого`);
    } else {
      ids.push(productId);
      localStorage.setItem("favorites", JSON.stringify(ids));
      setIsFavorite(true);
      toast.success(`${productName} додано до улюбленого`);
    }

    window.dispatchEvent(new CustomEvent("favorites-updated"));
  }

  return (
    <Button
      size="icon"
      variant="outline"
      className={`size-9 shrink-0 rounded-lg transition-colors ${
        isFavorite
          ? "border-primary bg-primary/10 text-primary"
          : "border-primary/20 text-muted-foreground hover:text-primary"
      }`}
      onClick={handleToggle}
      aria-label={
        isFavorite
          ? `Видалити ${productName} з улюбленого`
          : `Додати ${productName} до улюбленого`
      }
    >
      <Heart className={`size-4 ${isFavorite ? "fill-primary" : ""}`} />
    </Button>
  );
}
