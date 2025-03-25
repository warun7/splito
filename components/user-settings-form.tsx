"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import Image from "next/image";
import {
  Upload,
  Loader2,
  Link,
  ExternalLink,
  DollarSign,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { User } from "@/api/modelSchema/UserSchema";
import { useUpdateUser } from "@/features/user/hooks/use-update-profile";
import { UserDetails } from "@/features/user/api/client";
import { toast } from "sonner";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useUploadFile } from "@/features/files/hooks/use-balances";

// Currency options
const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "XLM", label: "XLM - Stellar Lumens", symbol: "XLM" },
];

// Stellar account addresses start with G and are 56 characters long
const stellarAddressPattern = /^G[A-Z0-9]{55}$/;

export function UserSettingsForm({ user }: { user: User }) {
  const { mutate: updateUser, isPending } = useUpdateUser();
  const {
    isConnected,
    address,
    isConnecting,
    connectWallet,
    disconnectWallet,
  } = useWallet();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const uploadFileMutation = useUploadFile();
  const [stellarError, setStellarError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserDetails>({
    name: user.name || "",
    image: user.image || "",
    stellarAccount: user.stellarAccount || "",
    currency: user.currency || "USD",
  });

  // Update the form with wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      setFormData((prev) => ({ ...prev, stellarAccount: address }));
      setStellarError(null);
    }
  }, [isConnected, address]);

  // Validate Stellar account format
  const validateStellarAccount = (
    address: string | null | undefined
  ): boolean => {
    if (!address || address.trim() === "") {
      setStellarError(null);
      return true; // Empty is valid
    }

    const isValid = stellarAddressPattern.test(address);
    if (!isValid) {
      setStellarError(
        "Stellar account must start with 'G' and be 56 characters long"
      );
      return false;
    }

    setStellarError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Stellar account before submission
    if (
      formData.stellarAccount &&
      !validateStellarAccount(formData.stellarAccount)
    ) {
      toast.error("Invalid Stellar account format", {
        description: stellarError,
      });
      return;
    }

    // Filter out undefined values and ensure proper types
    const updateData: UserDetails = {};

    if (
      formData.name !== undefined &&
      formData.name !== null &&
      formData.name.trim() !== ""
    ) {
      updateData.name = formData.name;
    }

    if (
      formData.image !== undefined &&
      formData.image !== null &&
      formData.image.trim() !== ""
    ) {
      updateData.image = formData.image;
    }

    if (
      formData.stellarAccount !== undefined &&
      formData.stellarAccount !== null &&
      formData.stellarAccount.trim() !== ""
    ) {
      updateData.stellarAccount = formData.stellarAccount;
    }

    if (formData.currency) {
      updateData.currency = formData.currency;
    }

    console.log("Submitting profile update with data:", updateData);

    updateUser(updateData);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Show loading state
      toast.loading("Uploading image...");

      // Upload the file to Google Cloud Storage
      const response = await uploadFileMutation.mutateAsync(file);

      if (response.success) {
        // Update form data with the image URL
        setFormData((prev) => ({ ...prev, image: response.data.downloadUrl }));
        toast.dismiss();
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.dismiss();
      toast.error("Failed to upload image. Please try again.");
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast.success("Wallet connected successfully!");
    } catch (error) {
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  const handleStellarAccountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, stellarAccount: value }));
    validateStellarAccount(value);
  };

  return (
    <div className="w-full bg-[#101012] border border-white/20 rounded-[18.24px] overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-white leading-10 tracking-[-0.03em] mb-8 text-center">
          Profile Settings
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-0.5 mb-4">
              <div className="h-full w-full rounded-full overflow-hidden bg-[#101012] flex items-center justify-center">
                {formData.image ? (
                  <Image
                    src={formData.image}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${
                      formData.stellarAccount || "user"
                    }`}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="h-full w-full"
                  />
                )}
              </div>
              <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#1E1E20] flex items-center justify-center cursor-pointer border border-white/10 hover:bg-white/10 transition-colors ">
                <Upload className="h-4 w-4 text-white/70" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isPending}
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white leading-7 tracking-[-0.03em]">
              Display Name
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full h-[47.43px] bg-[#0D0D0F] rounded-[11.86px] px-4 
                     text-base font-semibold text-white/40 leading-6 border border-white/20"
              placeholder="Enter your name"
              disabled={isPending}
            />
          </div>

          {/* Preferred Currency */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white leading-7 tracking-[-0.03em]">
              Preferred Currency
            </label>
            <div className="relative w-full">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <DollarSign className="h-4 w-4" />
              </div>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currency: e.target.value,
                  }))
                }
                className="w-full h-[47.43px] bg-[#0D0D0F] rounded-[11.86px] pl-10 pr-4
                       text-base font-semibold text-white/40 leading-6 border border-white/20
                       appearance-none"
                disabled={isPending}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="h-4 w-4 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/40">
              This currency will be used as your default for transactions and
              displays
            </p>
          </div>

          {/* Stellar Account */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-white leading-7 tracking-[-0.03em]">
              Stellar Account Address
            </label>
            <div className="flex flex-col gap-2">
              <div className="relative w-full">
                <input
                  type="text"
                  value={formData.stellarAccount || ""}
                  onChange={handleStellarAccountChange}
                  className={`w-full h-[47.43px] bg-[#0D0D0F] rounded-[11.86px] px-4
                         text-base font-semibold text-white/40 leading-6 border ${
                           stellarError ? "border-red-500" : "border-white/20"
                         }`}
                  placeholder="Enter your Stellar account address"
                  disabled={isPending || isConnecting}
                />
                {formData.stellarAccount && !stellarError && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${formData.stellarAccount}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    title="View on Stellar Explorer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {stellarError && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                )}
              </div>
              {stellarError && (
                <p className="text-sm text-red-500">{stellarError}</p>
              )}
              <button
                type="button"
                onClick={handleConnectWallet}
                disabled={isPending || isConnecting}
                className="h-[47.43px] bg-[#0D0D0F] rounded-[11.86px] px-4
                       text-base font-semibold text-white/70 leading-6 border border-white/20
                       hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting Wallet...
                  </>
                ) : isConnected ? (
                  <>
                    <Link className="h-4 w-4" />
                    Wallet Connected
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4" />
                    Connect Stellar Wallet
                  </>
                )}
              </button>

              {isConnected && (
                <button
                  type="button"
                  onClick={() => {
                    disconnectWallet();
                    toast.info("Wallet disconnected");
                  }}
                  disabled={isPending}
                  className="h-[47.43px] bg-transparent rounded-[11.86px] px-4
                         text-base font-semibold text-red-400/70 leading-6 border border-red-400/20
                         hover:bg-red-400/5 transition-colors flex items-center justify-center gap-2"
                >
                  Disconnect Wallet
                </button>
              )}

              <p className="text-sm text-white/40">
                This is the address that will be used for transactions. Connect
                your wallet to update automatically.
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <div className="animate-border-light">
              <button
                type="submit"
                className="w-[234.68px] h-[55.64px] bg-[#101012] rounded-[18.24px] 
                       text-xl font-semibold text-white leading-8 
                       tracking-[-0.03em] hover:bg-white/5 transition-colors
                       disabled:opacity-70 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
                disabled={isPending || !!stellarError}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full h-[55.64px] bg-[#0D0D0F] rounded-[18.24px] 
                   text-base font-semibold text-red-400/80 leading-8 
                   hover:bg-red-400/5 transition-colors
                   border border-red-400/20
                   flex items-center justify-center gap-2"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
