import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-muted/30 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
