// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Geist, Press_Start_2P } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const pressStart2P = Press_Start_2P({ subsets: ['latin'], weight: '400', variable: '--font-pixel' });

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
    <html lang="zh" className={cn("font-sans", geist.variable, pressStart2P.variable)}>
      <body className="bg-background text-foreground antialiased" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
