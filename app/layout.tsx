import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sorteio EQUUS",
  description: "Participe do Sorteio EQUUS e garanta seu numero da sorte.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
