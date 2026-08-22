"use client";

import * as React from "react";
import Link from "next/link";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompareIndicator() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    function updateCount() {
      try {
        const ids = JSON.parse(localStorage.getItem("compare") || "[]") as string[];
        setCount(ids.length);
      } catch {
        setCount(0);
      }
    }
    updateCount();
    window.addEventListener("compare-updated", updateCount);
    return () => window.removeEventListener("compare-updated", updateCount);
  }, []);

  if (count === 0) return null;

  return (
    <Button
      variant="ghost"
      className="relative hover:bg-muted/50 gap-1.5 px-2"
      render={<Link href="/compare" />}
      nativeButton={false}
    >
      <Scale className="size-5" />
      <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
        {count}
      </span>
      <span className="sr-only">Порівняння ({count})</span>
    </Button>
  );
}
