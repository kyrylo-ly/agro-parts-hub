"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import * as React from "react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-2xl ml-auto lg:ml-0">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук за назвою або артикулом..."
          className="h-10 w-full rounded-full bg-muted/50 pl-10 pr-4 transition-all focus-visible:bg-background focus-visible:ring-primary"
        />
      </div>
    </form>
  );
}
