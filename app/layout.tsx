import { Inter } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileMenuProvider } from "@/contexts/mobile-menu";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MobileMenuProvider>
          <Providers>
            <div className="min-h-screen bg-[#101012]">
              <Sidebar />
              <div className="lg:pl-[280px]">
                <Header />
                <main className="mt-[80px] bg-[#101012] p-4 lg:p-8">
                  {children}
                </main>
              </div>
            </div>
          </Providers>
        </MobileMenuProvider>
      </body>
    </html>
  );
}
