"use client";

import { Bell, Menu, Search, Settings, Wallet, X } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useMobileMenu } from "@/contexts/mobile-menu";
import { PageTitle } from "./page-title";
import { AddressDisplay } from "./address-display";

type WalletAddress = string | { address: string } | null | undefined;

export function Header() {
  const { isOpen, toggle } = useMobileMenu();
  const {
    isConnected,
    address,
    isConnecting,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  const formatAddress = (addr: WalletAddress): string => {
    if (!addr) return "";
    if (typeof addr === "string") return addr;
    return addr.address;
  };

  const handleWalletClick = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  return (
    <div className="fixed left-0 right-0 top-0 z-10 min-[1025px]:left-[280px] min-[1025px]:right-0">
      <div className="flex h-[80px] items-center justify-between  bg-zinc-950 px-4 backdrop-blur-md min-[1025px]:px-8">
        <div className="flex items-center gap-4 w-[200px]">
          <button onClick={toggle} className="min-[1025px]:hidden">
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-white whitespace-nowrap">
            <PageTitle />
          </h1>
        </div>

        <div className="hidden min-[1025px]:block flex-1 max-w-[400px]">
          <div className="flex h-12 items-center rounded-full bg-[#1F1F23]">
            <input
              type="text"
              placeholder="Search keywords"
              className="h-full w-full bg-transparent px-6 text-base text-white placeholder-white/70 outline-none"
            />
            <Search className="mr-6 h-5 w-5 text-white/70" />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <button
            onClick={handleWalletClick}
            disabled={isConnecting}
            className="group relative flex h-10 sm:h-12 items-center gap-2 rounded-full border border-white/20 bg-transparent px-4 sm:px-6 text-sm font-medium text-white transition-all duration-300 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
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
              {isConnecting ? (
                "Connecting..."
              ) : isConnected && address ? (
                <AddressDisplay address={formatAddress(address)} />
              ) : (
                "Connect Wallet"
              )}
            </span>
          </button>

          <button className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-[#1F1F23] transition-colors hover:bg-[#2a2a2e]">
            <Bell className="h-5 w-5 text-white" strokeWidth={1.5} />
          </button>

          <button className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-[#1F1F23] transition-colors hover:bg-[#2a2a2e]">
            <Settings className="h-5 w-5 text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
