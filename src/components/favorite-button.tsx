"use client";

import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoriteActions } from "@/hooks/use-favorite-actions";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: string;
  productName: string;
}

export function FavoriteButton({ productId, productName }: FavoriteButtonProps) {
  const { isFavorite, isPending, toggleFavorite } = useFavoriteActions(
    productId,
    productName
  );

  return (
    <Button
      size="icon"
      variant="outline"
      className={cn(
        "size-9 shrink-0 rounded-lg transition-colors",
        isFavorite
          ? "border-primary bg-primary/10 text-primary"
          : "border-primary/20 text-muted-foreground hover:text-primary"
      )}
      onClick={toggleFavorite}
      disabled={isPending}
      aria-label={
        isFavorite
          ? `Видалити ${productName} з улюбленого`
          : `Додати ${productName} до улюбленого`
      }
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Heart className={cn("size-4", isFavorite && "fill-primary")} />
      )}
    </Button>
  );
}
