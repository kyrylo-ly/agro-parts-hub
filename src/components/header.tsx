import { Flame, Percent, Phone, Sparkles, Tag } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

import { SearchBar } from "@/components/search-bar";
import { CartButton } from "@/components/cart-button";
import { UserMenu } from "@/components/user-menu";
import { CompareIndicator } from "@/components/compare-indicator";
import { FavoriteIndicator } from "@/components/favorite-indicator";
import { Logo } from "@/components/logo";

// Code-split heavy interactive components — they pull in Base UI Sheet/Popover/ScrollArea
const MobileNav = dynamic(
  () => import("@/components/mobile-nav").then((mod) => mod.MobileNav),
  { loading: () => <div className="size-9 lg:hidden" /> },
);
const CategoryMenu = dynamic(
  () => import("@/components/category-menu").then((mod) => mod.CategoryMenu),
  {
    loading: () => (
      <div className="hidden lg:block h-10 w-36 animate-pulse rounded-md bg-muted" />
    ),
  },
);
export type NavItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
};

export const bottomNav: NavItem[] = [
  { label: "Акції", icon: Percent, href: "/promotions" },
  { label: "Новинки", icon: Sparkles, href: "/new" },
  { label: "Хіти продажу", icon: Flame, href: "/bestsellers" },
  { label: "Бренди", icon: Tag, href: "/brands" },
];

export interface HeaderProps {
  categories?: {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string | null;
    children: {
      id: number;
      name: string;
      slug: string;
      imageUrl?: string | null;
    }[];
  }[];
}

export function Header({ categories = [] }: HeaderProps) {
  return (
    <>
      {/* Main Header - Sticky */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 shadow-sm">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-y-3 gap-x-4 px-4 py-3 lg:h-16 lg:flex-nowrap lg:gap-8 lg:px-8 lg:py-0 max-w-350">
          {/* Top row elements on mobile, left on desktop */}
          <div className="flex items-center gap-3 sm:gap-4">
            <MobileNav categories={categories} />

            {/* Logo */}
            <Logo hideTextOnMobile />
          </div>

          {/* Categories Button */}
          <div className="hidden lg:block">
            <CategoryMenu categories={categories} />
          </div>

          {/* Search Bar (Client) */}
          <div className="order-last w-full lg:order-0 lg:flex-1 lg:w-auto">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            <FavoriteIndicator />
            <CompareIndicator />
            <UserMenu />
            <CartButton />
          </div>
        </div>
      </header>

      {/* Bottom Nav Bar - Desktop only */}
      <div className="hidden border-b bg-muted/20 lg:block relative z-40">
        <div className="container mx-auto flex h-11 max-w-350 items-center justify-between px-8 text-sm">
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
                href="tel:+380952476193"
                className="hover:text-primary transition-colors"
              >
                +38 (095) 247-61-93
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
