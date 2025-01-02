import { useGroups, type Group } from "@/stores/groups";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from 'next/image';

export function GroupsList() {
  const { groups, deleteGroup, connectedAddress } = useGroups();
  const [editingId, setEditingId] = useState<string | null>(null);

  const getMyDebtInfo = (group: Group) => {
    if (!connectedAddress) return { amount: 0, type: "none" };

    // If I'm the payer, find how much others owe me
    if (group.paidBy === connectedAddress) {
      const othersOweMe = group.debts.reduce(
        (sum, debt) => sum + debt.amount,
        0
      );
      return { amount: othersOweMe, type: "owed" };
    }

    // If someone else paid, find how much I owe them
    const myDebt = group.debts.find((debt) => debt.from === connectedAddress);
    return {
      amount: myDebt?.amount || 0,
      type: "owe",
    };
  };

  return (
    <div className="mt-8">
      <h2 className="mb-6 text-xl font-semibold text-white">Groups</h2>
      <div className="space-y-4">
        {groups.map((group) => {
          const debtInfo = getMyDebtInfo(group);
          return (
            <div
              key={group.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-[#1F1F23]/50 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-lg">
                  <Image
                    src={group.image}
                    alt={group.name}
                    className="h-full w-full object-cover"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <p className="font-medium text-white">{group.name}</p>
                  <p className="text-sm text-white/70">
                    Created by {group.creator} • {group.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-white/70">
                    {debtInfo.type === "owed" ? "you are owed" : "you owe"}
                  </p>
                  <p
                    className={
                      debtInfo.type === "owed"
                        ? "text-[#67B76C]"
                        : "text-[#FF4444]"
                    }
                  >
                    ${debtInfo.amount.toFixed(2)}
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() =>
                      setEditingId(editingId === group.id ? null : group.id)
                    }
                    className="p-2 hover:bg-white/5 rounded-full"
                  >
                    <MoreVertical className="h-5 w-5 text-white/70" />
                  </button>

                  {editingId === group.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-white/10 bg-[#1F1F23] py-1 shadow-lg">
                      <Link
                        href={`/groups/${group.id}/edit`}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/5"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit Group
                      </Link>
                      <button
                        onClick={() => deleteGroup(group.id)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#FF4444] hover:bg-white/5"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Group
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
