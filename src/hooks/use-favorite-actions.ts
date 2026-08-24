import { useTransition, useOptimistic, useCallback } from "react";
import { useFavoritesStore } from "@/store/use-favorites";
import { useStoreHydration } from "@/hooks/use-store-hydration";
import { toast } from "sonner";

export function useFavoriteActions(productId: string, productName: string) {
  // Use hydration to prevent SSR mismatch since we rely on localStorage
  const isHydrated = useStoreHydration(useFavoritesStore, (state) => state.items.includes(productId));
  const isFavorite = isHydrated ?? false; // default to false on server/initial render

  // Optimistic UI state
  const [optimisticIsFavorite, addOptimisticIsFavorite] = useOptimistic(
    isFavorite,
    (state, newState: boolean) => newState
  );

  const [isPending, startTransition] = useTransition();

  const toggleFavorite = useCallback(() => {
    startTransition(() => {
      // Optimistically update UI
      addOptimisticIsFavorite(!isFavorite);
      
      // Update actual store
      useFavoritesStore.getState().toggleFavorite(productId);

      if (isFavorite) {
         toast.info(`${productName} видалено з улюбленого`);
      } else {
         toast.success(`${productName} додано до улюбленого`);
      }
      
      // Dispatch the custom event for any legacy components still relying on it
      window.dispatchEvent(new CustomEvent("favorites-updated"));
    });
  }, [isFavorite, productId, productName, addOptimisticIsFavorite]);

  return {
    isFavorite: optimisticIsFavorite,
    isPending,
    toggleFavorite,
  };
}
