"use client";

import { Bell, Menu, Search, Settings, Wallet, X } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useMobileMenu } from "@/contexts/mobile-menu";
import { PageTitle } from "./page-title";

export function Header() {
  const { isOpen, toggle } = useMobileMenu();
  const {
    isConnected,
    address,
    isConnecting,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  const handleWalletClick = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const formatAddress = (address: string | null | undefined) => {
    if (!address) return "No Address";
    if (typeof address === "object") {
      // If address is an object with an address property
      return (address as any).address || "No Address";
    }
    return address;
  };

  return (
    <div className="fixed left-0 right-0 top-0 z-10 lg:left-[280px]">
      <div className="flex h-[80px] items-center justify-between border-b border-white/10 bg-[#101012]/80 px-4 backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-4">
          <button onClick={toggle} className="lg:hidden">
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
          <h1 className="text-2xl font-semibold text-white lg:text-3xl">
            <PageTitle />
          </h1>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className="relative hidden lg:block">
            <div className="flex h-[45px] w-[400px] items-center rounded-full bg-[#1F1F23]">
              <input
                type="text"
                placeholder="Search keywords"
                className="h-full w-full bg-transparent px-6 text-base text-white placeholder-white/70 outline-none"
              />
              <Search className="mr-6 h-5 w-5 text-white/70" />
            </div>
          </div>

          <button
            onClick={handleWalletClick}
            disabled={isConnecting}
            className="group relative flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50 lg:px-6 lg:py-3 lg:text-lg"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              e.currentTarget.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.1), transparent)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Wallet className="h-5 w-5" strokeWidth={1.5} />
            <span className="hidden sm:inline">
              {isConnecting
                ? "Connecting..."
                : isConnected
                ? formatAddress(address!)
                : "Connect Wallet"}
            </span>
          </button>

          <button className="flex h-[45px] w-[45px] items-center justify-center rounded-full bg-[#1F1F23]">
            <Bell className="h-5 w-5 text-white" strokeWidth={1.5} />
          </button>

          <button className="flex h-[45px] w-[45px] items-center justify-center rounded-full bg-[#1F1F23]">
            <Settings className="h-5 w-5 text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
