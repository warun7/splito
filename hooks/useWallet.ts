"use client";

import { useState, useCallback, useEffect } from "react";
import { useGroups } from "@/stores/groups";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type WalletStore = {
  isConnected: boolean;
  address: string | null;
  balance: string;
  setWalletState: (state: {
    isConnected: boolean;
    address: string | null;
    balance: string;
  }) => void;
  disconnect: () => void;
};

const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      isConnected: false,
      address: null,
      balance: "0",
      setWalletState: (state) => set(state),
      disconnect: () =>
        set({ isConnected: false, address: null, balance: "0" }),
    }),
    {
      name: "wallet-storage",
    }
  )
);

export function useWallet() {
  const { isConnected, address, balance, setWalletState, disconnect } =
    useWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const { setConnectedAddress } = useGroups();

  const disconnectWallet = useCallback(() => {
    disconnect();
    setConnectedAddress(null);
  }, [disconnect, setConnectedAddress]);

  const getBalance = useCallback(
    async (address: string) => {
      try {
        const balance = await window.ethereum!.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        });

        const balanceInWei = parseInt(balance as string, 16);
        const ethBalance = balanceInWei / Math.pow(10, 18);

        setWalletState({
          isConnected: true,
          address,
          balance: ethBalance.toFixed(4),
        });
      } catch (error) {
        console.error("Error fetching balance:", error);
        setWalletState({ isConnected: true, address, balance: "0" });
      }
    },
    [setWalletState]
  );

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to connect your wallet!");
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setWalletState({ isConnected: true, address: accounts[0], balance: "0" });
      setConnectedAddress(accounts[0]);
      await getBalance(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      disconnectWallet();
    } finally {
      setIsConnecting(false);
    }
  }, [getBalance, setConnectedAddress, setWalletState, disconnectWallet]);

  // Check connection status on mount
  useEffect(() => {
    if (window.ethereum && address) {
      getBalance(address);
    }
  }, [address, getBalance]);

  return {
    isConnected,
    address,
    balance,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };
}
