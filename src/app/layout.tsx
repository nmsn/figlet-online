// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Figlet Fonts — ASCII Art Generator",
  description: "Browse 353 figlet fonts and generate ASCII art text effects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="bg-background text-foreground antialiased" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
