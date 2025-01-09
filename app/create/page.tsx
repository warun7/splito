"use client";

import { useGroups, type Group, type Split, type Debt } from "@/stores/groups";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";

export default function CreateGroupPage() {
  const router = useRouter();
  const { addGroup, connectedAddress } = useGroups();
  const { isConnected, address, connectWallet } = useWallet();

  useEffect(() => {
    // Check if wallet is connected on mount
    if (!isConnected && !address) {
      connectWallet();
    }
  }, [isConnected, address, connectWallet]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    members: "",
    paidBy: "",
    splitType: "equal",
    currency: "USD",
  });

  const [splits, setSplits] = useState<Split[]>([]);
  const [percentages, setPercentages] = useState<{ [key: string]: number }>({});

  // Calculate splits when members or split type changes
  useEffect(() => {
    if (!formData.members || !formData.amount) return;

    const memberAddresses = formData.members.split(",").map((m) => m.trim());
    const allMembers = [address!, ...memberAddresses].filter(Boolean);

    let newSplits: Split[] = [];

    switch (formData.splitType) {
      case "equal":
        const equalAmount = Number(formData.amount) / allMembers.length;
        newSplits = allMembers.map((addr) => ({
          address: addr,
          amount: equalAmount,
        }));
        break;

      case "percentage":
        const equalPercentage = 100 / allMembers.length;
        newSplits = allMembers.map((addr) => ({
          address: addr,
          amount: (Number(formData.amount) * equalPercentage) / 100,
          percentage: equalPercentage,
        }));
        break;

      case "custom":
        newSplits = allMembers.map((addr) => ({
          address: addr,
          amount: 0,
        }));
        break;
    }

    setSplits(newSplits);
  }, [formData.members, formData.amount, formData.splitType, address]);

  const updateCustomSplit = (address: string, amount: number) => {
    setSplits((current) =>
      current.map((split) =>
        split.address === address ? { ...split, amount } : split
      )
    );
  };

  const updatePercentage = (address: string, percentage: number) => {
    setPercentages((current) => ({
      ...current,
      [address]: percentage,
    }));

    // Update the actual split amounts based on the new percentage
    setSplits((current) =>
      current.map((split) =>
        split.address === address
          ? {
              ...split,
              amount: (formData.amount * percentage) / 100,
              percentage: percentage,
            }
          : split
      )
    );
  };

  // Calculate debts based on splits and payer
  const calculateDebts = (splits: Split[], paidBy: string): Debt[] => {
    const debts: Debt[] = [];
    const payer = splits.find((s) => s.address === paidBy);

    if (!payer) return debts;

    splits.forEach((split) => {
      if (split.address !== paidBy && split.amount > 0) {
        debts.push({
          from: split.address,
          to: paidBy,
          amount: split.amount,
        });
      }
    });

    return debts;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      alert("Please connect your wallet first!");
      return;
    }

    const debts = calculateDebts(splits, formData.paidBy);

    const newGroup: Group = {
      id: Date.now().toString(),
      name: formData.name,
      image: "/placeholder.jpg",
      creator: "You",
      creatorAddress: address,
      date: new Date().toLocaleDateString(),
      amount: Number(formData.amount),
      paidBy: formData.paidBy,
      members: formData.members.split(",").map((m) => m.trim()),
      splits,
      debts,
      splitType: formData.splitType as "equal" | "percentage" | "custom",
      currency: formData.currency as "USD" | "ETH",
      description: formData.description,
    };

    addGroup(newGroup);
    router.push("/groups");
  };

  // Set paidBy to connected address when available
  useEffect(() => {
    if (address && !formData.paidBy) {
      setFormData((prev) => ({ ...prev, paidBy: address }));
    }
  }, [address, formData.paidBy]);

  useEffect(() => {
    if (!formData.members || formData.splitType !== "percentage") return;

    const memberAddresses = formData.members.split(",").map((m) => m.trim());
    const allMembers = [address!, ...memberAddresses].filter(Boolean);
    const equalPercentage = 100 / allMembers.length;

    // Initialize percentages with equal split
    const initialPercentages = Object.fromEntries(
      allMembers.map((addr) => [addr, equalPercentage])
    );
    setPercentages(initialPercentages);
  }, [formData.members, formData.splitType, address]);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-semibold text-white">
          Create New Group
        </h1>
        <p className="mt-2 text-white/70">Create a new expense sharing group</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#1F1F23]/50 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white"
            >
              Group Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-2 block w-full rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white placeholder-white/50 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
              placeholder="Enter group name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-white"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="mt-2 block w-full rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white placeholder-white/50 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
              placeholder="Enter group description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-white"
              >
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: e.target.value ? Number(e.target.value) : "",
                  }))
                }
                className="mt-2 block w-full rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white placeholder-white/50 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-white"
              >
                Currency
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currency: e.target.value }))
                }
                className="mt-2 block w-full rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white"
              >
                <option value="USD">USD</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="members"
              className="block text-sm font-medium text-white"
            >
              Members (Wallet Addresses)
            </label>
            <input
              type="text"
              id="members"
              value={formData.members}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, members: e.target.value }))
              }
              className="mt-2 block w-full rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white placeholder-white/50 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
              placeholder="Enter wallet addresses separated by commas"
              required
            />
          </div>

          <div>
            <label
              htmlFor="splitType"
              className="block text-sm font-medium text-white"
            >
              Split Type
            </label>
            <select
              id="splitType"
              value={formData.splitType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, splitType: e.target.value }))
              }
              className="mt-2 block w-full rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white"
            >
              <option value="equal">Equal Split</option>
              <option value="percentage">Percentage Split</option>
              <option value="custom">Custom Split</option>
            </select>
          </div>

          {formData.splitType === "custom" && splits.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-white">Custom Split</h3>
              {splits.map((split) => (
                <div key={split.address} className="flex items-center gap-4">
                  <span className="text-sm text-white/70">
                    {split.address === address ? "You" : split.address}
                  </span>
                  <input
                    type="number"
                    value={split.amount}
                    onChange={(e) =>
                      updateCustomSplit(split.address, Number(e.target.value))
                    }
                    className="mt-2 block w-32 rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white"
                    placeholder="Amount"
                  />
                  <span className="text-sm text-white/70">
                    {formData.currency}
                  </span>
                </div>
              ))}
              <div className="mt-2 text-sm text-white/70">
                Total: {splits.reduce((sum, split) => sum + split.amount, 0)}{" "}
                {formData.currency}
              </div>
            </div>
          )}

          {formData.splitType === "percentage" && splits.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-white">
                Percentage Split
              </h3>
              {splits.map((split) => (
                <div key={split.address} className="flex items-center gap-4">
                  <span className="text-sm text-white/70">
                    {split.address === address ? "You" : split.address}
                  </span>
                  <input
                    type="text"
                    value={percentages[split.address] || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value) && Number(value) <= 100) {
                        updatePercentage(split.address, Number(value));
                      }
                    }}
                    className="mt-2 block w-32 rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white"
                    placeholder="Percentage"
                  />
                  <span className="text-sm text-white/70">%</span>
                </div>
              ))}
              <div className="mt-2 text-sm text-white/70">
                Total:{" "}
                {Object.values(percentages).reduce((sum, p) => sum + p, 0)}%
                {Math.abs(
                  Object.values(percentages).reduce((sum, p) => sum + p, 0) -
                    100
                ) > 0.01 && (
                  <span className="text-[#FF4444] ml-2">(Must equal 100%)</span>
                )}
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="paidBy"
              className="block text-sm font-medium text-white"
            >
              Paid By
            </label>
            <select
              id="paidBy"
              value={formData.paidBy}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, paidBy: e.target.value }))
              }
              className="mt-2 block w-full rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white"
            >
              <option value="">Select who paid</option>
              <option value={address!}>You</option>
              {formData.members.split(",").map((member) => (
                <option key={member.trim()} value={member.trim()}>
                  {member.trim()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-white px-4 py-2 text-center text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              Create Group
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-center text-sm font-medium text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
