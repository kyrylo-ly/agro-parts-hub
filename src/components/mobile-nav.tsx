"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Phone, Tractor, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { bottomNav } from "@/components/header";
import { cn } from "@/lib/utils";

import { Logo } from "@/components/logo";

interface MobileNavProps {
  categories?: {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string | null;
    children: { id: number; name: string; slug: string; imageUrl?: string | null }[];
  }[];
}

export function MobileNav({ categories = [] }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button aria-label="Відкрити меню" variant="ghost" size="icon" className="lg:hidden" />}
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle className="m-0 p-0">
            <Logo onClick={() => setOpen(false)} />
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <nav className="flex flex-col gap-4 px-4 py-4">
            {/* Categories from DB */}
            {categories.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  Каталог
                </span>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/catalog/${cat.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-muted overflow-hidden border">
                      {cat.imageUrl ? (
                        <Image
                          src={cat.imageUrl}
                          alt=""
                          width={24}
                          height={24}
                          className="size-full object-cover"
                        />
                      ) : (
                        <Truck className="size-3 text-muted-foreground" />
                      )}
                    </div>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
            <Separator />
            <div className="flex flex-col gap-1">
              <span className="px-2 text-sm font-semibold text-muted-foreground">
                Спеціальні пропозиції
              </span>
              {bottomNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <Separator />
            <div className="flex flex-col gap-1">
              <span className="px-2 text-sm font-semibold text-muted-foreground">
                Контакти
              </span>
              <a
                href="tel:+380000000000"
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
              >
                <Phone className="size-4" />
                +38 (000) 000-00-00
              </a>
            </div>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
