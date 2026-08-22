import { SectionHeader } from "@/components/section-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Гарантія",
};

export default function WarrantyPage() {
  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
      <SectionHeader title="Гарантія" subtitle="Гарантійні зобов'язання" />
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
        <p className="text-lg">Ця сторінка знаходиться в процесі розробки та наповнення.</p>
      </div>
    </div>
  );
}
