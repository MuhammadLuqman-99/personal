import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import MobileNav from "@/components/layout/MobileNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Media Tracker",
  description: "Track your books, PDFs, and videos",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <main className="min-h-screen pb-20 max-w-lg mx-auto">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
