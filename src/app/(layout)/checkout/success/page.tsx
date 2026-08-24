"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="container py-16 flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <div className="size-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
        <CheckCircle className="size-12" />
      </div>

      <h1 className="text-4xl font-bold">Дякуємо за замовлення!</h1>

      <div className="max-w-md space-y-4 text-muted-foreground">
        <p>
          Ваше замовлення успішно оформлено. Ми вже почали його обробляти.
        </p>
        {orderId && (
          <p className="bg-muted p-3 rounded-xl font-mono text-foreground font-medium text-sm">
            Номер замовлення: {orderId}
          </p>
        )}
        <p>
          Наш менеджер зв'яжеться з вами найближчим часом для уточнення деталей.
        </p>
      </div>

      <div className="flex gap-4 mt-4">
        <Link href="/categories">
          <Button size="lg" className="h-12 px-8">
            Продовжити покупки
          </Button>
        </Link>
        <Link href="/favorites">
          <Button variant="outline" size="lg" className="h-12 px-8">
            До улюбленого
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container py-16 flex flex-col items-center justify-center min-h-[60vh]">Завантаження...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
