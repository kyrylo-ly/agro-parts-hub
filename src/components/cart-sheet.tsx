"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { useCartStore } from "@/store/use-cart";
import { createQuickCartOrder } from "@/actions/orders";
import { toast } from "sonner";

interface CartSheetProps {
  children?: React.ReactElement;
}

export function CartSheet({ children }: CartSheetProps) {
  const [open, setOpen] = React.useState(false);
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Hydration mismatch fix for Zustand
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => setIsSuccess(false), 300);
    }
  }

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    const result = await createQuickCartOrder({
      name,
      phone,
      items: items.map(i => ({ productId: i.id, quantity: i.quantity }))
    });

    if (result.success) {
      clearCart();
      setIsSuccess(true);
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  }

  function formatPrice(p: string | number): string {
    return Number(p).toLocaleString("uk-UA");
  }

  if (!isMounted) {
    return <>{children}</>;
  }

  const totalPrice = getTotalPrice();

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={children}>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md bg-background p-0 border-l">
        <SheetHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="size-5" /> Кошик
          </SheetTitle>
        </SheetHeader>

        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="size-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold">Дякуємо за замовлення!</h3>
            <p className="text-sm text-muted-foreground">
              Ваше замовлення успішно оформлено. Ми зв'яжемося з вами найближчим часом.
            </p>
            <Button onClick={() => setOpen(false)} className="mt-4">
              Закрити
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Кошик порожній</h3>
            <p className="text-sm text-muted-foreground">
              Додайте товари з каталогу, щоб зробити замовлення.
            </p>
            <SheetClose render={<Button variant="outline" className="mt-4">Продовжити покупки</Button>}>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 bg-card rounded-xl border relative">
                  <Link href={`/product/${item.slug}`} className="shrink-0 size-20 relative bg-muted rounded-md overflow-hidden" onClick={() => setOpen(false)}>
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-contain p-1" />
                    ) : (
                      <ShoppingCart className="size-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/30" />
                    )}
                  </Link>
                  <div className="flex flex-col flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`} className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors pr-6" onClick={() => setOpen(false)}>
                      {item.name}
                    </Link>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="font-bold text-base whitespace-nowrap">{formatPrice(item.price)} ₴</span>

                      <div className="flex items-center bg-muted rounded-lg h-8 border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-card shrink-0">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-muted-foreground">Всього:</span>
                <span className="text-xl font-bold">{formatPrice(totalPrice)} ₴</span>
              </div>

              <form onSubmit={handleCheckout} className="flex flex-col gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cart-name">Ваше ім'я *</Label>
                  <Input id="cart-name" name="name" required minLength={2} placeholder="Ім'я" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cart-phone">Телефон *</Label>
                  <Input id="cart-phone" name="phone" type="tel" required placeholder="+380 XX XXX XX XX" />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full mt-2 h-11 text-base">
                  {isSubmitting ? "Оформлення..." : "Швидке замовлення (в 1 клік)"}
                </Button>
              </form>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Або</span>
                </div>
              </div>

              <Link href="/checkout" className="w-full" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full h-11 text-base">
                  Перейти до повного оформлення
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
