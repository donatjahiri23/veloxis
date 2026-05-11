import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AiChat } from "@/components/AiChat";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Veloxis | Marketing Intelligence Platform",
  description: "Real-time marketing attribution, identity resolution, and AI-powered campaign analytics",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('veloxis-theme');
              if (t) document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-screen flex">
        <ThemeProvider>
          <Sidebar />
          <main className="flex-1 lg:ml-64 min-h-screen">
            {children}
          </main>
          <AiChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
