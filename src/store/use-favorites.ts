import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  items: string[]; // Array of product IDs
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      addFavorite: (id) => {
        const { items } = get();
        if (!items.includes(id)) {
          set({ items: [...items, id] });
        }
      },
      removeFavorite: (id) => {
        set({ items: get().items.filter((itemId) => itemId !== id) });
      },
      toggleFavorite: (id) => {
        const { items } = get();
        if (items.includes(id)) {
          set({ items: items.filter((itemId) => itemId !== id) });
        } else {
          set({ items: [...items, id] });
        }
      },
      isFavorite: (id) => get().items.includes(id),
    }),
    {
      name: "agro-favorites-storage",
    }
  )
);
