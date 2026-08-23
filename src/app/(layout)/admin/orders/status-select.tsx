"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/actions/admin/orders";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statuses = [
  { value: "pending", label: "Очікує" },
  { value: "processing", label: "В обробці" },
  { value: "shipped", label: "Відправлено" },
  { value: "delivered", label: "Доставлено" },
  { value: "cancelled", label: "Скасовано" },
];

export function StatusSelect({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(value: string | null) {
    if (!value) return;
    
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, value as any);
      if (result.success) {
        toast.success("Статус оновлено");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Select
      defaultValue={initialStatus}
      onValueChange={handleStatusChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[130px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status.value} value={status.value} className="text-xs">
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
