"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadSingleImage } from "@/actions/upload";

interface SingleImageUploaderProps {
  folder: string;
  currentImageUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function SingleImageUploader({
  folder,
  currentImageUrl,
  onUpload,
  onRemove,
}: SingleImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
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

      const result = await uploadSingleImage(folder, formData);
      if (!result.success) {
        toast.error(result.error);
      } else {
        onUpload(result.data.url);
      }
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error("Помилка обробки зображення");
    }

    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  }

  if (currentImageUrl) {
    return (
      <div className="relative group rounded-md overflow-hidden border aspect-video bg-muted max-w-sm">
        <img
          src={currentImageUrl}
          alt="Uploaded"
          className="w-full h-full object-contain bg-white"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={onRemove}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors max-w-sm"
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
          <p className="text-sm">Перетягніть фото або натисніть</p>
          <p className="text-xs">JPEG, PNG, WebP. Макс. 5 МБ</p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(e) => handleUpload(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
