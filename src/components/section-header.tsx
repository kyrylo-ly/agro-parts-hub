import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkText?: string;
}

export function SectionHeader({
  title,
  subtitle,
  href,
  linkText = "Дивитись всі",
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 lg:mb-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-muted-foreground text-sm lg:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          aria-label={linkText === "Дивитись всі" ? `Дивитись всі ${title.toLowerCase()}` : linkText}
          className="group flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {linkText}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
