"use client";

import * as React from "react";
import { ChevronRight, Grid2X2, Settings, Wrench, Zap, CircleDashed } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Мокові дані для категорій (потім можна замінити на дані з БД)
const categories = [
  {
    id: "engine",
    name: "Двигуни та запчастини",
    icon: Zap,
    subcategories: [
      { name: "Блоки циліндрів", href: "/category/engine/blocks" },
      { name: "Поршневі групи", href: "/category/engine/pistons" },
      { name: "Колінчасті вали", href: "/category/engine/crankshafts" },
      { name: "Головки блоку", href: "/category/engine/heads" },
      { name: "Турбіни", href: "/category/engine/turbines" },
    ],
  },
  {
    id: "chassis",
    name: "Ходова частина",
    icon: CircleDashed,
    subcategories: [
      { name: "Амортизатори", href: "/category/chassis/shocks" },
      { name: "Підшипники", href: "/category/chassis/bearings" },
      { name: "Ступиці", href: "/category/chassis/hubs" },
      { name: "Рульові тяги", href: "/category/chassis/steering" },
    ],
  },
  {
    id: "tools",
    name: "Інструменти та обладнання",
    icon: Wrench,
    subcategories: [
      { name: "Ключі", href: "/category/tools/wrenches" },
      { name: "Домкрати", href: "/category/tools/jacks" },
      { name: "Спецінструмент", href: "/category/tools/special" },
    ],
  },
  {
    id: "maintenance",
    name: "Витратні матеріали",
    icon: Settings,
    subcategories: [
      { name: "Фільтри масляні", href: "/category/maintenance/filters-oil" },
      { name: "Фільтри повітряні", href: "/category/maintenance/filters-air" },
      { name: "Мастила", href: "/category/maintenance/oil" },
      { name: "Герметики", href: "/category/maintenance/sealants" },
    ],
  },
];

export function CategoryMenu() {
  const [activeCategory, setActiveCategory] = React.useState(categories[0]);
  const [isOpen, setIsOpen] = React.useState(false);

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
          {/* Ліва колонка: Головні категорії */}
          <div className="w-1/3 border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="flex flex-col py-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory.id === category.id;
                  return (
                    <button
                      key={category.id}
                      onMouseEnter={() => setActiveCategory(category)}
                      onClick={() => setActiveCategory(category)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-muted",
                        isActive
                          ? "bg-muted text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="size-4" />
                        {category.name}
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

          {/* Права колонка: Підкатегорії */}
          <div className="w-2/3 p-6">
            <ScrollArea className="h-full">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {activeCategory.name}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {activeCategory.subcategories.map((sub) => (
                  <Link
                    key={sub.name}
                    href={sub.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex flex-col items-center justify-center gap-2 rounded-lg border bg-card p-4 text-center transition-colors hover:border-primary hover:bg-muted/50"
                  >
                    {/* Плейсхолдер для картинки (можна замінити на Image з next/image) */}
                    <div className="flex size-16 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-background">
                      <Grid2X2 className="size-8 opacity-20" />
                    </div>
                    <span className="text-sm font-medium">{sub.name}</span>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
