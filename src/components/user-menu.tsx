"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/account-menu";

/**
 * Client component that renders either the AccountMenu (when logged in)
 * or a login button (when logged out).
 *
 * Uses authClient.useSession() so the root layout no longer needs
 * headers() / auth.api.getSession(), which was forcing SSR on every page.
 *
 * On first render (before hydration) shows a skeleton placeholder to avoid
 * a visible layout shift.
 */
export function UserMenu() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    // Skeleton — same size as the real button to avoid layout shift
    return (
      <div
        aria-hidden
        className="h-9 w-9 animate-pulse rounded-full bg-muted lg:h-9 lg:w-24 lg:rounded-md"
      />
    );
  }

  if (session?.user) {
    return (
      <AccountMenu
        name={session.user.name ?? ""}
        email={session.user.email ?? ""}
        avatar={session.user.image ?? ""}
        role={(session.user as { role?: string }).role ?? ""}
      />
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:w-auto lg:px-4 shrink-0"
      render={
        <Link href="/login" aria-label="Увійти" className="flex items-center gap-2" />
      }
      nativeButton={false}
    >
      <User className="size-5 lg:hidden" />
      <span className="hidden lg:inline-block">Увійти</span>
    </Button>
  );
}
