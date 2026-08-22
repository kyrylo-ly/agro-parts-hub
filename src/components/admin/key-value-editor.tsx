"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface KeyValueEditorProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export function KeyValueEditor({ value, onChange }: KeyValueEditorProps) {
  const entries = Object.entries(value);

  function addRow() {
    onChange({ ...value, "": "" });
  }

  function removeRow(key: string) {
    const copy = { ...value };
    delete copy[key];
    onChange(copy);
  }

  function updateKey(oldKey: string, newKey: string) {
    const newValue: Record<string, string> = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === oldKey) {
        newValue[newKey] = v;
      } else {
        newValue[k] = v;
      }
    }
    onChange(newValue);
  }

  function updateValue(key: string, newVal: string) {
    onChange({ ...value, [key]: newVal });
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, val], index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder="Назва (напр. діаметр)"
            value={key ?? ""}
            onChange={(e) => updateKey(key, e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Значення (напр. 12 мм)"
            value={val ?? ""}
            onChange={(e) => updateValue(key, e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeRow(key)}
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="size-4 mr-1" />
        Додати атрибут
      </Button>
    </div>
  );
}
