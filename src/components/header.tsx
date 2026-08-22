import {
  Flame,
  Heart,
  Percent,
  Phone,
  Sparkles,
  Tag,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { CartButton } from "@/components/cart-button";
import { MobileNav } from "@/components/mobile-nav";
import { AccountMenu } from "@/components/account-menu";
import { CategoryMenu } from "@/components/category-menu";
import { CompareIndicator } from "@/components/compare-indicator";
import { FavoriteIndicator } from "@/components/favorite-indicator";

type AccountData = {
  name: string;
  email: string;
  avatar: string;
  role: string;
};

export type NavItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
};

export const bottomNav: NavItem[] = [
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

interface HeaderProps extends AccountData {
  categories?: {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string | null;
    children: { id: number; name: string; slug: string; imageUrl?: string | null }[];
  }[];
}

export function Header({ name, email, avatar, role, categories = [] }: HeaderProps) {
  return (
    <>
      {/* Main Header - Sticky */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-y-3 gap-x-4 px-4 py-3 lg:h-16 lg:flex-nowrap lg:gap-8 lg:px-8 lg:py-0 max-w-[1400px]">
          {/* Top row elements on mobile, left on desktop */}
          <div className="flex items-center gap-3 sm:gap-4">
            <MobileNav categories={categories} />

            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <div className="flex aspect-square size-9 lg:size-10 items-center justify-center rounded-lg bg-primary">
                <Image
                  src={appLogo.src}
                  alt={appLogo.alt}
                  width={28}
                  height={28}
                  className="size-6 lg:size-7 invert dark:invert-0"
                />
              </div>
              <span className="hidden font-bold text-xl tracking-tight sm:inline-block">
                {appLogo.title}
              </span>
            </Link>
          </div>

          {/* Catalog Button */}
          <div className="hidden lg:block">
            <CategoryMenu categories={categories} />
          </div>

          {/* Search Bar (Client) */}
          <div className="order-last w-full lg:order-none lg:flex-1 lg:w-auto">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            <FavoriteIndicator />
            <CompareIndicator />

            {email ? (
              <AccountMenu name={name} email={email} avatar={avatar} role={role} />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="lg:w-auto lg:px-4 shrink-0"
                render={<Link href="/login" aria-label="Увійти" className="flex items-center gap-2" />}
                nativeButton={false}
              >
                <User className="size-5 lg:hidden" />
                <span className="hidden lg:inline-block">Увійти</span>
              </Button>
            )}

            <CartButton />
          </div>
        </div>
      </header>

      {/* Bottom Nav Bar - Desktop only */}
      <div className="hidden border-b bg-muted/20 lg:block relative z-40">
        <div className="container mx-auto flex h-11 max-w-[1400px] items-center justify-between px-8 text-sm">
          <nav className="flex items-center gap-6">
            {bottomNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-6 text-foreground/80">
            <div className="flex items-center gap-4">
              <Link
                href="/delivery"
                className="hover:text-primary transition-colors"
              >
                Доставка і оплата
              </Link>
              <Link
                href="/about"
                className="hover:text-primary transition-colors"
              >
                Про нас
              </Link>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Phone className="size-4" />
              <a
                href="tel:+380000000000"
                className="hover:text-primary transition-colors"
              >
                +38 (000) 000-00-00
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
