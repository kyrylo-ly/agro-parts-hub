import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/">) {

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-muted/30 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
