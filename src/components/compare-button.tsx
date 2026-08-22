"use client";

import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as React from "react";

const MAX_COMPARE = 4;

interface CompareButtonProps {
  productId: string;
  productName: string;
}

export function CompareButton({ productId, productName }: CompareButtonProps) {
  const [isInCompare, setIsInCompare] = React.useState(false);

  React.useEffect(() => {
    function check() {
      const ids = JSON.parse(localStorage.getItem("compare") || "[]") as string[];
      setIsInCompare(ids.includes(productId));
    }
    check();
    window.addEventListener("compare-updated", check);
    return () => window.removeEventListener("compare-updated", check);
  }, [productId]);

  function handleToggle() {
    const ids = JSON.parse(localStorage.getItem("compare") || "[]") as string[];

    if (ids.includes(productId)) {
      const next = ids.filter((id) => id !== productId);
      localStorage.setItem("compare", JSON.stringify(next));
      setIsInCompare(false);
      toast.info(`${productName} видалено з порівняння`);
    } else {
      if (ids.length >= MAX_COMPARE) {
        toast.warning(`Максимум ${MAX_COMPARE} товари для порівняння`);
        return;
      }
      ids.push(productId);
      localStorage.setItem("compare", JSON.stringify(ids));
      setIsInCompare(true);
      toast.success(`${productName} додано до порівняння`);
    }

    window.dispatchEvent(new CustomEvent("compare-updated"));
  }

  return (
    <Button
      size="icon"
      variant="outline"
      className={`size-9 shrink-0 rounded-lg transition-colors ${
        isInCompare
          ? "border-primary bg-primary/10 text-primary"
          : "border-primary/20 text-muted-foreground hover:text-primary"
      }`}
      onClick={handleToggle}
      aria-label={
        isInCompare
          ? `Видалити ${productName} з порівняння`
          : `Додати ${productName} до порівняння`
      }
    >
      <Scale className="size-4" />
    </Button>
  );
}
