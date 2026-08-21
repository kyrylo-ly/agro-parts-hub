"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
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
import { deleteCollection } from "@/actions/collections";

interface CollectionWithCount {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  productCount: number;
  createdAt: Date;
}

export function CollectionsTable({
  collections,
}: {
  collections: CollectionWithCount[];
}) {
  const router = useRouter();

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Видалити колекцію "${title}"?`)) return;

    const result = await deleteCollection(id);
    if (result.success) {
      toast.success("Колекцію видалено");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Колекцій поки немає.{" "}
        <Link href="/admin/collections/new" className="text-primary underline">
          Створити першу
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Назва</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Продуктів</TableHead>
            <TableHead className="w-[100px]">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((col) => (
            <TableRow key={col.id}>
              <TableCell className="font-medium">{col.title}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-mono text-xs">
                  {col.slug}
                </Badge>
              </TableCell>
              <TableCell>{col.productCount}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/collections/${col.id}/edit`}>
                    <Button variant="ghost" size="icon" className="size-8">
                      <Pencil className="size-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(col.id, col.title)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
