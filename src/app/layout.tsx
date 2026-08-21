import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});


export const metadata: Metadata = {
  title: "Запчастини для тракторів. Підшипники",
  description: "Магазин запчастин для тракторів МТЗ. Будь які підшипники. Великий асортимент, низькі ціни.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {

  return (
    <html
      lang="uk"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}</body>
    </html>
  );
}
