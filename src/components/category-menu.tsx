"use client";

import * as React from "react";
import { ChevronRight, Grid2X2, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CategoryMenuProps {
  categories?: {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string | null;
    children: { id: number; name: string; slug: string; imageUrl?: string | null }[];
  }[];
}

export function CategoryMenu({ categories = [] }: CategoryMenuProps) {
  const [activeCategory, setActiveCategory] = React.useState(categories[0]);
  const [isOpen, setIsOpen] = React.useState(false);

  // Update active category when categories prop changes
  React.useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  if (categories.length === 0) {
    return (
      <Button
        variant="default"
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        render={<Link href="/catalog" />}
        nativeButton={false}
      >
        <Grid2X2 className="size-4" />
        <span className="hidden sm:inline-block">Каталог товарів</span>
        <span className="sm:hidden">Каталог</span>
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="default"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          />
        }
      >
        <Grid2X2 className="size-4" />
        <span className="hidden sm:inline-block">Каталог товарів</span>
        <span className="sm:hidden">Каталог</span>
      </PopoverTrigger>
      <PopoverContent
        className="w-[90vw] max-w-5xl p-0"
        align="start"
        sideOffset={16}
      >
        <div className="flex h-[500px]">
          {/* Left column: Main categories */}
          <div className="w-1/3 border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="flex flex-col py-2">
                {categories.map((cat) => {
                  const isActive = activeCategory?.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onMouseEnter={() => setActiveCategory(cat)}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-muted",
                        isActive
                          ? "bg-muted text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background overflow-hidden border">
                          {cat.imageUrl ? (
                            <Image
                              src={cat.imageUrl}
                              alt={cat.name}
                              width={32}
                              height={32}
                              className="size-full object-cover"
                            />
                          ) : (
                            <Truck className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-left line-clamp-1">{cat.name}</span>
                      </div>
                      <ChevronRight
                        className={cn(
                          "size-4 transition-transform",
                          isActive ? "translate-x-1" : "opacity-50"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right column: Subcategories */}
          <div className="w-2/3 p-6">
            <ScrollArea className="h-full">
              {activeCategory && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      {activeCategory.name}
                    </h3>
                    <Link
                      href={`/catalog/${activeCategory.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="text-sm text-primary hover:underline"
                    >
                      Дивитись всі
                    </Link>
                  </div>
                  {activeCategory.children.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {activeCategory.children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/catalog/${sub.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-3 rounded-lg border bg-card p-4 text-sm font-medium transition-colors hover:border-primary hover:bg-muted/50"
                        >
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted overflow-hidden border transition-colors group-hover:bg-primary/10">
                            {sub.imageUrl ? (
                              <Image
                                src={sub.imageUrl}
                                alt={sub.name}
                                width={40}
                                height={40}
                                className="size-full object-cover"
                              />
                            ) : (
                              <Truck className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </div>
                          <span className="line-clamp-2">{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Підкатегорій немає
                    </p>
                  )}
                </>
              )}
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
