"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/use-favorites";
import { useStoreHydration } from "@/hooks/use-store-hydration";

export function FavoriteIndicator() {
  const count = useStoreHydration(
    useFavoritesStore,
    (state) => state.items.length,
  );

  if (!count || count === 0) return null;

  return (
    <Button
      variant="ghost"
      className="relative hover:bg-muted/50 gap-1.5 px-2"
      render={<Link href="/favorites" />}
      nativeButton={false}
    >
      <Heart className="size-5" />
      <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
        {count}
      </span>
      <span className="sr-only">Улюблене ({count})</span>
    </Button>
  );
}
