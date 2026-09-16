"use client";

import { MessageCircle, Phone } from "lucide-react";
import { telNumber } from "@/const/tel-number";

export function ContactFloat() {
  const viberLink = `viber://chat?number=%2B38${telNumber.replace(/\D/g, "").slice(-10)}`;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 md:bottom-8 md:right-8">
      <a
        href={viberLink}
        className="flex size-14 items-center justify-center rounded-full bg-[#7360f2] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
        aria-label="Написати у Viber"
      >
        <MessageCircle className="size-6" />
      </a>

      <a
        href={`tel:${telNumber}`}
        className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 active:scale-95"
        aria-label="Зателефонувати"
      >
        <Phone className="size-6" />
      </a>
    </div>
  );
}
