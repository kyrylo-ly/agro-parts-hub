import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Header } from "@/components/header";

export default async function MainLayout({ children }: LayoutProps<"/">) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      <Header
        name={session?.user.name ?? ""}
        email={session?.user.email ?? ""}
        avatar={session?.user.image ?? ""}
      />
      {children}
    </>
  );
}
