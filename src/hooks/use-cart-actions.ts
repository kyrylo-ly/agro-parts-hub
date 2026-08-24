import { useTransition, useCallback } from "react";
import { useCartStore } from "@/store/use-cart";
import { toast } from "sonner";
import { createQuickCartOrder } from "@/actions/orders";

export function useCartActions() {
  const [isPending, startTransition] = useTransition();

  const addToCart = useCallback((
    item: { id: string; name: string; price: string; slug: string; imageUrl?: string }
  ) => {
    startTransition(() => {
      useCartStore.getState().addItem(item);
      toast.success(`${item.name} додано до кошика`);
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    startTransition(() => {
      useCartStore.getState().removeItem(id);
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    startTransition(() => {
      useCartStore.getState().updateQuantity(id, quantity);
    });
  }, []);

  const clearCart = useCallback(() => {
    startTransition(() => {
      useCartStore.getState().clearCart();
    });
  }, []);

  const checkoutCart = useCallback(async (formData: FormData) => {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const items = useCartStore.getState().items;

    const result = await createQuickCartOrder({
      name,
      phone,
      items: items.map(i => ({ productId: i.id, quantity: i.quantity }))
    });

    if (result.success) {
      clearCart();
    }
    return result;
  }, [clearCart]);

  return {
    isPending,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkoutCart,
  };
}
