"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBrand {
  slug: string;
  name: string;
  productCount: number;
}

interface FilterAttribute {
  key: string;
  values: string[];
}

interface CatalogFiltersProps {
  brands: FilterBrand[];
  attributes: FilterAttribute[];
  basePath: string;
  variant?: "desktop" | "mobile" | "both";
}

const sortOptions = [
  { value: "newest", label: "Новинки" },
  { value: "price_asc", label: "Ціна ↑" },
  { value: "price_desc", label: "Ціна ↓" },
  { value: "popular", label: "Популярні" },
  { value: "bestsellers", label: "Хіти продажу" },
] as const;

export function CatalogFilters({
  brands,
  attributes,
  basePath,
  variant = "both",
}: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Current filter state from URL
  const currentBrands = searchParams.get("brand")?.split(",") ?? [];
  const currentPriceMin = searchParams.get("price_min") ?? "";
  const currentPriceMax = searchParams.get("price_max") ?? "";
  const currentInStock = searchParams.get("in_stock") === "1";
  const currentSort = searchParams.get("sort") ?? "newest";

  // Get current attribute filters
  const currentAttrs: Record<string, string[]> = {};
  for (const attr of attributes) {
    const paramKey = `attr_${attr.key}`;
    const val = searchParams.get(paramKey);
    if (val) {
      currentAttrs[attr.key] = val.split(",");
    }
  }

  function applyFilters(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    // Remove page when filters change
    params.delete("page");

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function clearAllFilters() {
    router.push(basePath);
  }

  const hasFilters =
    currentBrands.length > 0 ||
    currentPriceMin !== "" ||
    currentPriceMax !== "" ||
    currentInStock ||
    Object.keys(currentAttrs).length > 0;

  const filterContent = (
    <div className="flex flex-col gap-5">
      {/* Sort */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Сортування</Label>
        <Select
          value={currentSort}
          onValueChange={(value) => applyFilters({ sort: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Ціна, ₴</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Від"
            defaultValue={currentPriceMin}
            onBlur={(e) => applyFilters({ price_min: e.target.value || null })}
            className="h-9"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="До"
            defaultValue={currentPriceMax}
            onBlur={(e) => applyFilters({ price_max: e.target.value || null })}
            className="h-9"
          />
        </div>
      </div>

      <Separator />

      {/* In Stock */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="in-stock"
          checked={currentInStock}
          onCheckedChange={(checked) =>
            applyFilters({ in_stock: checked ? "1" : null })
          }
        />
        <Label htmlFor="in-stock" className="text-sm cursor-pointer">
          Тільки в наявності
        </Label>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <>
          <Separator />
          <div>
            <Label className="text-sm font-semibold mb-2 block">Бренд</Label>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {brands.map((br) => {
                const isChecked = currentBrands.includes(br.slug);
                return (
                  <div key={br.slug} className="flex items-center gap-2">
                    <Checkbox
                      id={`brand-${br.slug}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...currentBrands, br.slug]
                          : currentBrands.filter((s) => s !== br.slug);
                        applyFilters({
                          brand: next.length > 0 ? next.join(",") : null,
                        });
                      }}
                    />
                    <Label
                      htmlFor={`brand-${br.slug}`}
                      className="flex-1 text-sm cursor-pointer"
                    >
                      {br.name}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {br.productCount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Dynamic Attributes */}
      {attributes.map((attr) => (
        <React.Fragment key={attr.key}>
          <Separator />
          <div>
            <Label className="text-sm font-semibold mb-2 block capitalize">
              {attr.key.replace(/_/g, " ")}
            </Label>
            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto">
              {attr.values.map((val) => {
                const paramKey = `attr_${attr.key}`;
                const current = currentAttrs[attr.key] ?? [];
                const isChecked = current.includes(val);
                return (
                  <div key={val} className="flex items-center gap-2">
                    <Checkbox
                      id={`${paramKey}-${val}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...current, val]
                          : current.filter((v) => v !== val);
                        applyFilters({
                          [paramKey]: next.length > 0 ? next.join(",") : null,
                        });
                      }}
                    />
                    <Label
                      htmlFor={`${paramKey}-${val}`}
                      className="text-sm cursor-pointer"
                    >
                      {val}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </React.Fragment>
      ))}

      {/* Clear filters */}
      {hasFilters && (
        <>
          <Separator />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-destructive hover:text-destructive"
          >
            <X className="mr-2 size-4" />
            Очистити фільтри
          </Button>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {(variant === "both" || variant === "desktop") && (
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 rounded-xl border bg-card p-4">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider">
              Фільтри
            </h2>
            {filterContent}
          </div>
        </aside>
      )}

      {/* Mobile Sheet Trigger */}
      {(variant === "both" || variant === "mobile") && (
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="sm" className="gap-2" />
              }
            >
              <SlidersHorizontal className="size-4" />
              Фільтри
              {hasFilters && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  !
                </span>
              )}
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh]">
              <SheetHeader>
                <SheetTitle>Фільтри</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto py-4">{filterContent}</div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </>
  );
}
