"use client";

import { useGroups, type Group, type Split, type Debt } from "@/stores/groups";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { splitter } from "@/utils/splitter";

export default function EditGroupPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { groups, updateGroup } = useGroups();
  const { address } = useWallet();
  const group = groups.find((g) => g.id === params.id);

  const [splits, setSplits] = useState<Split[]>([]);
  const [formData, setFormData] = useState({
    name: group?.name || "",
    description: group?.description || "",
    amount: group?.amount || 0,
    members: group?.members.join(", ") || "",
    splitType: group?.splitType || "equal",
    currency: group?.currency || "USD",
    paidBy: group?.paidBy || "",
  });

  useEffect(() => {
    if (group) {
      setSplits(group.splits);
    }
  }, [group]);

  useEffect(() => {
    if (!formData.members || !formData.amount || !formData.paidBy || !address)
      return;

    const memberAddresses = formData.members.split(",").map((m) => m.trim());
    const allMembers = Array.from(
      new Set([address, ...memberAddresses])
    ).filter(Boolean);

    if (formData.splitType === "custom") {
      const newSplits = allMembers.map((addr) => ({
        address: addr,
        amount: splits.find((s) => s.address === addr)?.amount || 0,
      }));
      setSplits(newSplits);
    } else {
      const { splits: newSplits } = splitter(
        formData.splitType as "equal" | "percentage",
        formData.amount,
        allMembers,
        formData.paidBy
      );
      setSplits(newSplits);
    }
  }, [
    formData.members,
    formData.amount,
    formData.splitType,
    formData.paidBy,
    address,
    splits,
  ]);

  const calculateDebts = (splits: Split[], paidBy: string): Debt[] => {
    const debts: Debt[] = [];

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

  const updateCustomSplit = (address: string, amount: number) => {
    setSplits((current) =>
      current.map((split) =>
        split.address === address ? { ...split, amount } : split
      )
    );
  };

  const validateSplits = () => {
    const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
    return Math.abs(totalSplit - formData.amount) < 0.01; // Allow for small floating point differences
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.splitType === "custom" && !validateSplits()) {
      alert("The sum of splits must equal the total amount!");
      return;
    }

    if (!group || !formData.paidBy) {
      alert("Please select who paid for the expense!");
      return;
    }

    const debts = calculateDebts(splits, formData.paidBy);

    const updatedGroup: Partial<Group> = {
      name: formData.name,
      description: formData.description,
      amount: Number(formData.amount),
      members: formData.members.split(",").map((m) => m.trim()),
      splitType: formData.splitType as "equal" | "percentage" | "custom",
      currency: formData.currency as "USD" | "ETH",
      splits,
      paidBy: formData.paidBy,
      debts,
    };

    updateGroup(params.id, updatedGroup);
    router.push("/groups");
  };

  const handleSplitTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSplitType = e.target.value as "equal" | "percentage" | "custom";
    setFormData((prev) => ({
      ...prev,
      splitType: newSplitType,
    }));
  };

  if (!group) return null;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-semibold text-white">
          Edit Group
        </h1>
        <p className="mt-2 text-white/70">
          Update your expense sharing group details
        </p>
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
              className="mt-2 block w-full rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white"
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
              className="mt-2 block w-full rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white"
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
                    amount: Number(e.target.value),
                  }))
                }
                className="mt-2 block w-full rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white"
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
                  setFormData((prev) => ({
                    ...prev,
                    currency: e.target.value as "USD" | "ETH",
                  }))
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
            <div className="mt-2 text-sm text-white/70 mb-2">
              Your address: {address} (automatically included)
            </div>
            <input
              type="text"
              id="members"
              value={formData.members}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, members: e.target.value }))
              }
              className="mt-2 block w-full rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white"
              placeholder="Enter other members' wallet addresses separated by commas"
            />
          </div>

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
              {formData.members
                .split(",")
                .map((member) => member.trim())
                .map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
            </select>
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
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const newSplitType = e.target.value as "equal" | "percentage" | "custom";
                setFormData((prev) => ({ ...prev, splitType: newSplitType }));
              }}
              className="mt-2 block w-full rounded-lg border border-white/10 bg-[#1F1F23] px-4 py-2 text-white"
            >
              <option value="equal">Equal Split</option>
              <option value="percentage">Percentage Split</option>
              <option value="custom">Custom Split</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-white px-4 py-2 text-center text-sm font-medium text-black"
            >
              Save Changes
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
              <span className="text-sm text-white/70">{formData.currency}</span>
            </div>
          ))}
          <div className="mt-2 text-sm text-white/70">
            Total: {splits.reduce((sum, split) => sum + split.amount, 0)}{" "}
            {formData.currency}
          </div>
        </div>
      )}
    </div>
  );
}
