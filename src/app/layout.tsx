import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Header } from "@/components/header";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});


export const metadata: Metadata = {
  title: "Запчастини для тракторів. Підшипники",
  description: "Магазин запчастин для тракторів МТЗ. Будь які підшипники. Великий асортимент, низькі ціни.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <html
      lang="uk"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header
          name={session?.user.name ?? ""}
          email={session?.user.email ?? ""}
          avatar={session?.user.image ?? ""}
        />
        {children}</body>
    </html>
  );
}
