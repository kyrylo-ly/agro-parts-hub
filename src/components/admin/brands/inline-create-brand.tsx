"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createBrand } from "@/actions/brands";

export function InlineCreateBrand({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;

    setLoading(true);
    const result = await createBrand({ name: name.trim() });
    setLoading(false);

    if (result.success) {
      toast.success(`Бренд "${name}" створено`);
      setName("");
      onCreated();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Назва нового бренду..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleCreate();
          }
        }}
        className="max-w-sm"
      />
      <Button onClick={handleCreate} disabled={loading || !name.trim()}>
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4 mr-1" />
        )}
        Додати
      </Button>
    </div>
  );
}
