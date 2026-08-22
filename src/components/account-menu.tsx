"use client";

import Link from "next/link";
import {
  Heart,
  LogOut,
  Package,
  Settings,
  UserRoundCog,
} from "lucide-react";

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
import { signOutAction } from "@/actions/auth";

interface AccountMenuProps {
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export function AccountMenu({ name, email, avatar, role }: AccountMenuProps) {
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
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link
              href="/profile/orders"
              className="flex w-full cursor-pointer items-center"
            />
          }
        >
          <Package className="mr-2 size-4" />
          Мої замовлення
        </DropdownMenuItem>
        <DropdownMenuItem
          render={
            <Link
              href="/favorites"
              className="flex w-full cursor-pointer items-center"
            />
          }
        >
          <Heart className="mr-2 size-4" />
          Улюблене
        </DropdownMenuItem>
        <DropdownMenuItem
          render={
            <Link
              href="/profile/settings"
              className="flex w-full cursor-pointer items-center"
            />
          }
        >
          <Settings className="mr-2 size-4" />
          Налаштування
        </DropdownMenuItem>

        {role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={
                <Link
                  href="/admin"
                  className="flex w-full cursor-pointer items-center text-primary"
                />
              }
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
            render={
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center text-destructive focus:text-destructive"
              />
            }
          >
            <LogOut className="mr-2 size-4" />
            Вийти
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
