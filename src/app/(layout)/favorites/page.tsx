import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FavoritePageClient } from "@/components/favorite-page-client";

export const metadata: Metadata = {
  title: "Улюблені товари",
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
      <Breadcrumbs
        items={[
          { label: "Головна", href: "/" },
          { label: "Улюблені товари" },
        ]}
      />
      <h1 className="mt-4 mb-6 text-2xl font-bold tracking-tight lg:text-3xl">
        Улюблені товари
      </h1>
      <FavoritePageClient />
    </div>
  );
}