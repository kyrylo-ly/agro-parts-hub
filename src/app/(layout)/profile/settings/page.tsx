import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { User } from "lucide-react";
import { auth } from "@/lib/auth";
import { SettingsForm } from "./settings-form";

export const metadata = {
  title: "Налаштування профілю",
};

export const instant = false;

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-16 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-3 rounded-full text-primary">
          <User className="size-6" />
        </div>
        <h1 className="text-3xl font-bold">Налаштування профілю</h1>
      </div>

      <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Особисті дані</h2>
        <SettingsForm initialName={session.user.name} email={session.user.email} />
      </div>
    </div>
  );
}
