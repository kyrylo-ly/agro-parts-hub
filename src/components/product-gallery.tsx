"use client";

import * as React from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: { url: string }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border bg-muted/30">
        <Package className="size-20 text-muted-foreground/30" />
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-col sm:overflow-y-auto sm:overflow-x-visible sm:max-h-[500px] sm:pb-0 sm:pr-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:size-20",
                idx === activeIndex
                  ? "border-primary ring-1 ring-primary/30"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={`${productName} — зображення ${idx + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="group relative aspect-square flex-1 overflow-hidden rounded-xl border bg-muted/10">
        <Image
          src={activeImage.url}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className="object-contain p-6 transition-transform duration-300 group-hover:scale-110"
        />
      </div>
    </div>
  );
}
