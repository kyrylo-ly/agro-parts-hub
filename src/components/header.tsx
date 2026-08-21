"use client";

import {
  Briefcase,
  ChevronDown,
  ChevronsUpDown,
  ClipboardList,
  Globe2,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
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

type NavItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  children?: NavItem[];
};

type AccountItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
};

type AccountData = {
  name: string;
  email: string;
  avatar: string;
};

const mainNav: NavItem[] = [
  { label: "Communities", icon: Globe2, href: "/communities" },
  {
    label: "Initiatives",
    icon: ClipboardList,
    href: "/initiatives",
  },
  // { label: "Users", icon: Users, href: "/users" },
  { label: "Offers", icon: Briefcase, href: "/offers" },
  // { label: "Suppliers", icon: Truck, href: "/suppliers" },
];

const accountItems: AccountItem[] = [
  // { label: "Communities", icon: Globe2, href: "/communities" },
  // { label: "Initiatives", icon: ClipboardList, href: "/initiatives" },
  // { label: "Contributions", icon: FileText, href: "/contributions" },
  // { label: "Offers", icon: Briefcase, href: "/offers" },
  { label: "Profile", icon: User, href: "/profile" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

const appLogo = {
  src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
  alt: "RazomPay",
  title: "RazomPay",
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavButton({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActivePath(pathname, item.href);

  if (!item.children?.length) {
    return (
      <Button
        variant={active ? "secondary" : "ghost"}
        className={cn("gap-2", active && "font-medium")}
        render={<Link href={item.href} className="flex items-center gap-2" />}
        nativeButton={false}
      >
        <item.icon className="size-4" />
        {item.label}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant={active ? "secondary" : "ghost"}
            className={cn("gap-1", active && "font-medium")}
          />
        }
      >
        <item.icon className="size-4" />
        {item.label}
        <ChevronDown className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {item.children.map((child) => {
          const ChildIcon = child.icon;
          const childActive = isActivePath(pathname, child.href);

          return (
            <DropdownMenuItem
              key={child.label}
              render={
                <Link href={child.href} className="flex items-center gap-2" />
              }
              className={cn(childActive && "bg-muted font-medium")}
            >
              <ChildIcon className="size-4" />
              {child.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" />}
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-primary">
              <img
                src={appLogo.src}
                alt={appLogo.alt}
                className="size-6 invert dark:invert-0"
              />
            </div>
            {appLogo.title}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <nav className="flex flex-col gap-4 px-4 py-4">
            <div className="flex flex-col gap-1">
              {mainNav.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <React.Fragment key={item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                        active && "bg-muted font-medium",
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                    {item.children?.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isActivePath(pathname, child.href);

                      return (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm hover:bg-muted",
                            childActive && "bg-muted font-medium",
                          )}
                        >
                          <ChildIcon className="size-4" />
                          {child.label}
                        </Link>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
            <Separator />
            <div className="flex flex-col gap-1">
              {accountItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function AccountMenu({ account }: { account: AccountData }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="gap-2 px-2" />}
      >
        <Avatar className="size-8">
          <AvatarImage src={account.avatar} alt={account.name} />
          <AvatarFallback>
            {account.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium md:inline">
          {account.name}
        </span>
        <ChevronsUpDown className="hidden size-4 md:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{account.name}</p>
            <p className="text-xs text-muted-foreground">{account.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accountItems.map((item) => {
          const Icon = item.icon;

          return (
            <DropdownMenuItem
              key={item.label}
              render={<Link href={item.href} className="flex items-center" />}
            >
              <Icon className="mr-2 size-4" />
              {item.label}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuItem
          key="Log out"
          render={<form action={signOutAction} className="flex items-center" />}
        >
          <LogOut className="mr-2 size-4" />
          <button type="submit">Log out</button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header(accountData: AccountData) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        <MobileNav pathname={pathname} />

        <Link href="/" className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-primary">
            <img
              src={appLogo.src}
              alt={appLogo.alt}
              className="size-6 invert dark:invert-0"
            />
          </div>
          <span className="font-semibold">{appLogo.title}</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {mainNav.map((item) => (
            <NavButton key={item.label} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="h-9 w-64 pl-8"
            />
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="size-5" />
          </Button>
          {accountData.name ? (
            <AccountMenu account={accountData} />
          ) : (
            <Button
              render={<Link href="/login" className="flex items-center" />}
              nativeButton={false}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
