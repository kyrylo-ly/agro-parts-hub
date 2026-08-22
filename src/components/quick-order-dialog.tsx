"use client";

import * as React from "react";
import { Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createQuickOrder } from "@/actions/orders";

interface QuickOrderDialogProps {
  productId: string;
  productName: string;
  price: string;
}

export function QuickOrderDialog({
  productId,
  productName,
  price,
}: QuickOrderDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    const result = await createQuickOrder({ productId, name, phone });

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Reset state on close
      setError("");
      setSuccess(false);
    }
  }

  function formatPrice(p: string): string {
    return parseFloat(p).toLocaleString("uk-UA");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2 rounded-lg flex-1 sm:flex-none" />
        }
      >
        <Zap className="size-4" />
        Замовлення в 1 клік
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="size-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Дякуємо!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ваше замовлення прийнято. Ми зателефонуємо вам для підтвердження.
              </p>
            </div>
            <Button onClick={() => setOpen(false)}>Закрити</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Замовлення в 1 клік</DialogTitle>
              <DialogDescription>
                {productName} — <span className="font-semibold">{formatPrice(price)} ₴</span>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="quick-name">Ваше ім&apos;я *</Label>
                <Input
                  id="quick-name"
                  name="name"
                  required
                  minLength={2}
                  placeholder="Ім'я"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quick-phone">Телефон *</Label>
                <Input
                  id="quick-phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+380 XX XXX XX XX"
                  autoComplete="tel"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Оформлення..." : "Замовити"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Натискаючи «Замовити», ви погоджуєтесь з обробкою персональних даних
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
