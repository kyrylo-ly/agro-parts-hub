import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

function buildUrl(
  baseUrl: string,
  page: number,
  searchParams?: Record<string, string | string[] | undefined>
) {
  const params = new URLSearchParams();

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "page") continue;
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value) {
        params.set(key, value);
      }
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const pages: (number | "...")[] = [];
  const delta = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav aria-label="Пагінація" className="flex justify-center pt-8">
      <div className="flex items-center gap-1">
        {/* Previous */}
        {currentPage > 1 && (
          <Link
            href={buildUrl(baseUrl, currentPage - 1, searchParams)}
            rel="prev"
            className="flex size-10 items-center justify-center rounded-lg border text-sm transition-colors hover:bg-muted"
            aria-label="Попередня сторінка"
          >
            <ChevronRight className="size-4 rotate-180" />
          </Link>
        )}

        {/* Page numbers */}
        {pages.map((page, idx) =>
          page === "..." ? (
            <span
              key={`dots-${idx}`}
              className="flex size-10 items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Link
              key={page}
              href={buildUrl(baseUrl, page, searchParams)}
              className={`flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "border hover:bg-muted"
              }`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Link>
          )
        )}

        {/* Next */}
        {currentPage < totalPages && (
          <Link
            href={buildUrl(baseUrl, currentPage + 1, searchParams)}
            rel="next"
            className="flex size-10 items-center justify-center rounded-lg border text-sm transition-colors hover:bg-muted"
            aria-label="Наступна сторінка"
          >
            <ChevronRight className="size-4" />
          </Link>
        )}
      </div>
    </nav>
  );
}
