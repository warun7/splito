"use client";

import { Instrument_Sans } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { MobileMenuToggle } from "@/components/mobile-menu-toggle";
import { MobileMenuProvider } from "@/contexts/mobile-menu";
import "./globals.css";
import { Providers } from "@/components/providers";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthPage = usePathname().match(/^\/login|^\/signup/);

  return (
    <html lang="en">
      <body className={instrumentSans.className}>
        <MobileMenuProvider>
          <Providers>
            {isAuthPage ? (
              children
            ) : (
              <div className="min-h-screen bg-[#09090B]">
                <Sidebar />
                <MobileMenuToggle />
                <div className="min-[1025px]:pl-[260px] min-h-screen flex flex-col">
                  <main className="flex-1 bg-[#09070B]/80 p-4 pt-16 min-[1025px]:pt-4 min-[1125px]:p-8 relative">
                    <div className="w-full">{children}</div>
                  </main>
                </div>
              </div>
            )}
          </Providers>
        </MobileMenuProvider>
        <Toaster position="top-right" theme="dark" />
      </body>
    </html>
  );
}
