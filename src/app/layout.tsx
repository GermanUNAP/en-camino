import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Toaster } from "@/components/ui/sonner";
import WhatsAppButton from "../../components/WhatsaapButton";
import { Suspense } from "react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "En Camino Puno",
  description: "Cada escaneo, una historia que transforma",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={cn(geistSans.variable, geistMono.variable, "min-h-screen bg-background antialiased flex flex-col ")}>
        <Suspense><Navbar /></Suspense>
        <main className="p-4 flex-grow">{children}</main>
        <Toaster />
        <Footer />
        <WhatsAppButton /> 
      </body>
    </html>
  );
}