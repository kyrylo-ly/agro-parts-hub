import Link from "next/link";
import { Tractor } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  onClick?: () => void;
  hideTextOnMobile?: boolean;
}

export function Logo({ className, onClick, hideTextOnMobile = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Агро Літ - Головна"
      onClick={onClick}
      className={cn("flex shrink-0 items-center gap-2", className)}
    >
      <div className="flex aspect-square size-8 lg:size-10 items-center justify-center rounded-lg bg-primary">
        <Tractor className="text-primary-foreground size-5 lg:size-6" />
      </div>
      <span
        className={cn(
          "font-bold text-xl text-primary tracking-tight",
          hideTextOnMobile ? "hidden sm:inline-block" : ""
        )}
      >
        Агро Літ
      </span>
    </Link>
  );
}
