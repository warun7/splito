"use client";

import { useGroups } from "@/stores/groups";
import { useRouter } from "next/navigation";

export function GroupInfoHeader({ groupId }: { groupId: string }) {
  const { groups } = useGroups();
  const router = useRouter();
  const group = groups.find((g) => g.id === groupId);

  if (!group) return null;

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-semibold text-white">
            {group.name}
          </h1>
          <div className="inline-flex items-center rounded-xl bg-[#1F1F23]/50 px-3 py-1">
            <span className="text-sm text-white/70">
              Total Group Balance:{" "}
              <span className="text-[#67B76C]">${group.amount}</span>
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="animate-border-light w-full sm:w-[173px]">
            <button
              onClick={() => router.push(`/groups/${groupId}/edit`)}
              className="w-full h-[46px] rounded-[15px] bg-[#262627] bg-opacity-80 text-sm font-medium text-white hover:bg-[#383838] transition-colors"
            >
              Add Expense
            </button>
          </div>
          <div className="animate-border-light w-full sm:w-[173px]">
            <button className="w-full h-[46px] rounded-[15px] bg-[#262627] bg-opacity-80 text-sm font-medium text-white hover:bg-[#383838] transition-colors">
              Settle Debts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
