import {
  Flame,
  Heart,
  Percent,
  Phone,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/search-bar";
import { CartButton } from "@/components/cart-button";
import { MobileNav } from "@/components/mobile-nav";
import { AccountMenu } from "@/components/account-menu";
import { CategoryMenu } from "@/components/category-menu";

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
    children: { id: number; name: string; slug: string }[];
  }[];
}

export function Header({ name, email, avatar, role, categories = [] }: HeaderProps) {
  return (
    <>
      {/* Main Header - Sticky */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 lg:px-8 lg:gap-8">
          <MobileNav categories={categories} />

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
            <CategoryMenu categories={categories} />
          </div>

          {/* Search Bar (Client) */}
          <SearchBar />

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 ml-auto">
            <Button
              variant="ghost"
              className="hover:bg-muted/50 hidden sm:flex gap-1.5 px-2"
              render={<Link href="/favorites" />}
              nativeButton={false}
            >
              <Heart className="size-5" />
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
                <Heart className="size-5" />
                Увійти
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

          <div className="flex items-center gap-6 text-muted-foreground">
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
