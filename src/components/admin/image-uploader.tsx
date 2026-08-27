"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadProductImage, deleteProductImage } from "@/actions/upload";

interface ProductImageData {
  id: string;
  url: string;
  orderIndex: number;
}

interface ImageUploaderProps {
  productId: string;
  images: ProductImageData[];
  onImagesChange: () => void;
}

export function ImageUploader({
  productId,
  images,
  onImagesChange,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const options = {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: "image/webp" as const,
          initialQuality: 0.8,
        };
        const imageCompression = (await import("browser-image-compression"))
          .default;
        const compressedFile = await imageCompression(file, options);

        const formData = new FormData();
        formData.append("file", compressedFile);

        const result = await uploadProductImage(productId, formData);
        if (!result.success) {
          toast.error(result.error);
        }
      } catch (error) {
        console.error("Error compressing image:", error);
        toast.error("Помилка обробки зображення");
      }
    }
    setUploading(false);
    onImagesChange();
  }

  async function handleDelete(imageId: string) {
    setDeletingId(imageId);
    const result = await deleteProductImage(imageId);
    setDeletingId(null);

    if (result.success) {
      toast.success("Зображення видалено");
      onImagesChange();
    } else {
      toast.error(result.error);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-sm">Завантаження...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="size-8" />
            <p className="text-sm">
              Перетягніть зображення або натисніть для вибору
            </p>
            <p className="text-xs">JPEG, PNG, WebP, AVIF. Макс. 5 МБ</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-md overflow-hidden border aspect-square bg-muted"
            >
              <img
                src={image.url}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="size-8"
                  disabled={deletingId === image.id}
                  onClick={() => handleDelete(image.id)}
                >
                  {deletingId === image.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <X className="size-4" />
                  )}
                </Button>
              </div>
              {image.orderIndex === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Головне
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
