"use client";

import {
  Flame,
  Heart,
  LogOut,
  Menu,
  Package,
  Percent,
  Phone,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Tag,
  TrendingUp,
  User,
  UserRoundCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/actions/auth";
import Image from "next/image";
import { CategoryMenu } from "./category-menu";

type NavItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
};

type AccountData = {
  name: string;
  email: string;
  avatar: string;
  role: string;
};

const bottomNav: NavItem[] = [
  { label: "Акції", icon: Percent, href: "/promotions" },
  { label: "Новинки", icon: Sparkles, href: "/new" },
  { label: "Хіти продажу", icon: Flame, href: "/bestsellers" },
  { label: "Найпопулярніші", icon: TrendingUp, href: "/popular" },
  { label: "Бренди", icon: Tag, href: "/brands" },
];

const appLogo = {
  src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
  alt: "Агро Літ",
  title: "Агро Літ",
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="lg:hidden" />}
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-primary">
              <Image
                src={appLogo.src}
                alt={appLogo.alt}
                width={24}
                height={24}
                className="size-6 invert dark:invert-0"
              />
            </div>
            {appLogo.title}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <nav className="flex flex-col gap-4 px-4 py-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-muted-foreground">Каталог</span>
              <Link href="/category/engine" className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
                Двигуни та запчастини
              </Link>
              <Link href="/category/chassis" className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
                Ходова частина
              </Link>
              <Link href="/category/tools" className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
                Інструменти та обладнання
              </Link>
              <Link href="/category/maintenance" className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
                Витратні матеріали
              </Link>
            </div>
            <Separator />
            <div className="flex flex-col gap-1">
              <span className="px-2 text-sm font-semibold text-muted-foreground">Спеціальні пропозиції</span>
              {bottomNav.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted",
                      active && "bg-muted font-medium text-primary"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <Separator />
            <div className="flex flex-col gap-1">
              <span className="px-2 text-sm font-semibold text-muted-foreground">Контакти</span>
              <a href="tel:+380000000000" className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted">
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

function AccountMenu({ name, email, avatar, role }: AccountData) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="gap-2 px-2 hover:bg-muted/50" />}
      >
        <Avatar className="size-8">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>
              {name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium lg:inline-block">
            {name}
          </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href="/profile/orders" className="flex w-full cursor-pointer items-center" />}
        >
          <Package className="mr-2 size-4" />
          Мої замовлення
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href="/profile/favorites" className="flex w-full cursor-pointer items-center" />}
        >
          <Heart className="mr-2 size-4" />
          Улюблене
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href="/profile/settings" className="flex w-full cursor-pointer items-center" />}
        >
          <Settings className="mr-2 size-4" />
          Налаштування
        </DropdownMenuItem>
        
        {role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={<Link href="/admin" className="flex w-full cursor-pointer items-center text-primary" />}
            >
              <UserRoundCog className="mr-2 size-4" />
              Адмін-панель
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem
            nativeButton
            render={<button type="submit" className="flex w-full cursor-pointer items-center text-destructive focus:text-destructive" />}
          >
            <LogOut className="mr-2 size-4" />
            Вийти
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header({ name, email, avatar, role }: AccountData) {
  const pathname = usePathname();

  return (
    <>
      {/* Middle Bar (Main) - Sticky */}
      <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
        <div className="container mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 lg:px-8 lg:gap-8">
        <MobileNav pathname={pathname} />

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary">
            <Image
              src={appLogo.src}
              alt={appLogo.alt}
              width={28}
              height={28}
              className="size-7 invert dark:invert-0"
            />
          </div>
          <span className="hidden font-bold text-xl tracking-tight sm:inline-block">
            {appLogo.title}
          </span>
        </Link>

        {/* Catalog Button */}
        <div className="hidden lg:block">
          <CategoryMenu />
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl ml-auto lg:ml-0">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              type="search"
              placeholder="Пошук за назвою або артикулом..."
              className="h-10 w-full rounded-full bg-muted/50 pl-10 pr-4 transition-all focus-visible:bg-background focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Actions (Favorites, Cart, Profile) */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 ml-auto">
          <Button
            variant="ghost"
            className="hover:bg-muted/50 hidden sm:flex gap-1.5 px-2"
            render={<Link href="/profile/favorites" />}
            nativeButton={false}
          >
            <Heart className="size-6" />
            <span className="text-sm font-medium">0</span>
            <span className="sr-only">Улюблене</span>
          </Button>

          {email ? (
            <AccountMenu name={name} email={email} avatar={avatar} role={role} />
          ) : (
            <Button
              variant="ghost"
              className="gap-2 hidden lg:flex"
              render={<Link href="/login" className="flex items-center" />}
              nativeButton={false}
            >
              <User className="size-5" />
              Увійти
            </Button>
          )}

          <Button variant="default" className="gap-2 rounded-full pl-3 pr-4 h-10 bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90">
            <div className="relative">
              <ShoppingCart className="size-5" />
              <span className="absolute -right-2 -top-2 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground dark:bg-background dark:text-foreground">
                3
              </span>
            </div>
            <div className="hidden flex-col items-start lg:flex ml-1">
              <span className="text-[10px] font-semibold uppercase leading-none opacity-70">Кошик</span>
              <span className="text-sm font-bold leading-none">1 240 ₴</span>
            </div>
          </Button>
        </div>
        </div>
      </header>

      {/* Bottom Bar (Nav Links & Contacts) - Hides under main bar on scroll */}
      <div className="hidden border-b bg-muted/20 lg:block relative z-40">
        <div className="container mx-auto flex h-12 max-w-[1400px] items-center justify-between px-8 text-sm">
          {/* Nav Links */}
          <nav className="flex items-center gap-6">
            {bottomNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 font-medium transition-colors hover:text-primary",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("size-4", active && "text-primary")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          {/* Contacts & Info */}
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-4">
              <Link href="/delivery" className="hover:text-primary transition-colors">Доставка і оплата</Link>
              <Link href="/about" className="hover:text-primary transition-colors">Про нас</Link>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Phone className="size-4" />
              <a href="tel:+380000000000" className="hover:text-primary transition-colors">+38 (000) 000-00-00</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
