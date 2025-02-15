"use client";

import { Menu, Wallet } from "lucide-react";
import { useMobileMenu } from "@/contexts/mobile-menu";
import { useWallet } from "@/hooks/useWallet";
import { AddressDisplay } from "@/components/address-display";
import Image from "next/image";

export function Header() {
  const { isOpen, toggle } = useMobileMenu();
  const { isConnected, isConnecting, address, connectWallet } = useWallet();

  const handleWalletClick = () => {
    if (!isConnected) {
      connectWallet();
    }
  };

  return (
    <div className="fixed left-0 right-0 top-0 z-10 min-[1025px]:pl-[280px]">
      <div className="h-[110px]  bg-[#101012] px-4 min-[1025px]:px-8">
        <div className="flex h-full items-center">
          <button
            onClick={toggle}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1F1F23] transition-colors hover:bg-[#2a2a2e] min-[1025px]:hidden"
          >
            <Menu className="h-5 w-5 text-white" strokeWidth={1.5} />
          </button>

          <div className="flex flex-1 items-center justify-end gap-2 lg:gap-4">
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
                  <AddressDisplay address={address} />
                ) : (
                  "Connect Wallet"
                )}
              </span>
            </button>

            {isConnected && address && (
              <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-0.5">
                <div className="h-full w-full rounded-full overflow-hidden bg-[#101012]">
                  <Image
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="h-full w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
