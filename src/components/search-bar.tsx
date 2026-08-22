"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchProductsQuick } from "@/actions/public";

type QuickResult = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  brand: { name: string } | null;
  images: { url: string }[];
};

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<QuickResult[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(null);

  // Debounced search
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      const res = await searchProductsQuick(trimmed);
      if (res.success) {
        setResults(res.data);
        setIsOpen(res.data.length > 0);
      }
      setIsLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Click outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < results.length ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex === results.length) {
          // "Show all" link
          handleSubmit(e as unknown as React.FormEvent);
        } else if (activeIndex >= 0 && activeIndex < results.length) {
          setIsOpen(false);
          router.push(`/product/${results[activeIndex].slug}`);
        } else {
          handleSubmit(e as unknown as React.FormEvent);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  }

  function formatPrice(price: string): string {
    return parseFloat(price).toLocaleString("uk-UA");
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <div className="relative group">
          {isLoading ? (
            <Loader2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          )}
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Пошук за назвою або артикулом..."
            className="h-10 w-full rounded-full bg-muted/50 pl-10 pr-4 transition-all focus-visible:bg-background focus-visible:ring-primary"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            autoComplete="off"
          />
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
          <ul role="listbox" className="py-1">
            {results.map((item, idx) => (
              <li key={item.id} role="option" aria-selected={idx === activeIndex}>
                <Link
                  href={`/product/${item.slug}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted ${
                    idx === activeIndex ? "bg-muted" : ""
                  }`}
                >
                  {/* Image */}
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted/30">
                    {item.images[0]?.url ? (
                      <Image
                        src={item.images[0].url}
                        alt={item.name}
                        fill
                        sizes="40px"
                        className="object-contain p-0.5"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="size-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.brand?.name && (
                        <span className="mr-2">{item.brand.name}</span>
                      )}
                      Код: {item.sku}
                    </p>
                  </div>

                  {/* Price */}
                  <span className="shrink-0 text-sm font-bold text-primary">
                    {formatPrice(item.price)} ₴
                  </span>
                </Link>
              </li>
            ))}

            {/* Show all link */}
            <li>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-center gap-2 border-t px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-muted ${
                  activeIndex === results.length ? "bg-muted" : ""
                }`}
              >
                <Search className="size-3.5" />
                Показати всі результати
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
