"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { deleteBrand, updateBrand } from "@/actions/brands";
import { InlineCreateBrand } from "./inline-create-brand";

interface Brand {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  createdAt: Date;
}

export function BrandsTable({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Видалити бренд "${name}"?`)) return;

    const result = await deleteBrand(id);
    if (result.success) {
      toast.success("Бренд видалено");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function startEdit(brand: Brand) {
    setEditingId(brand.id);
    setEditName(brand.name);
    setEditSlug(brand.slug);
    setEditImageUrl(brand.imageUrl || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditSlug("");
    setEditImageUrl("");
  }

  async function handleUpdate(id: number) {
    if (!editName.trim()) return;
    
    setIsUpdating(true);
    const result = await updateBrand(id, { 
      name: editName.trim(), 
      slug: editSlug.trim() || undefined,
      imageUrl: editImageUrl.trim() || null
    });
    setIsUpdating(false);

    if (result.success) {
      toast.success("Бренд оновлено");
      setEditingId(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <InlineCreateBrand onCreated={() => router.refresh()} />

      {brands.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Брендів поки немає. Створіть перший вище або через форму продукту.
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Зображення</TableHead>
                <TableHead>Назва</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-[120px]">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    {b.imageUrl ? (
                      <img src={b.imageUrl} alt={b.name} className="w-10 h-10 object-contain rounded-md border bg-white" />
                    ) : (
                      <div className="w-10 h-10 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">Немає</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {editingId === b.id ? (
                      <div className="flex flex-col gap-2">
                        <Input 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                          placeholder="Назва"
                        />
                        <Input 
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          className="h-8"
                          placeholder="URL зображення"
                        />
                      </div>
                    ) : (
                      b.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === b.id ? (
                      <Input 
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="h-8 font-mono text-xs"
                        placeholder={b.slug}
                      />
                    ) : (
                      <Badge variant="secondary" className="font-mono text-xs">
                        {b.slug}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === b.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-green-600 hover:text-green-700"
                          onClick={() => handleUpdate(b.id)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground"
                          onClick={cancelEdit}
                          disabled={isUpdating}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-primary"
                          onClick={() => startEdit(b)}
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(b.id, b.name)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
