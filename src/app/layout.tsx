import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "../../components/Navbar";
import { Toaster } from "@/components/ui/sonner"


const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "En Camino Puno",
  description: "Cada escaneo, una historia que transforma",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={cn(geistSans.variable, geistMono.variable, "min-h-screen bg-background antialiased")}>
        <Navbar />
        <main className="p-4">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
