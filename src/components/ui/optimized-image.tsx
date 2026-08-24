"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface OptimizedImageProps extends ImageProps {
  containerClassName?: string;
  fallback?: React.ReactNode;
}

export function OptimizedImage({
  className,
  containerClassName,
  fallback,
  alt,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {isLoading && (
        fallback ? fallback : (
          <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-none" />
        )
      )}
      <Image
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        alt={alt}
        {...props}
      />
    </div>
  );
}
