import { useGroups, type Group } from "@/stores/groups";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function GroupsList() {
  const { groups, deleteGroup, connectedAddress } = useGroups();
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".group-menu")) {
        setEditingId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
            <div key={group.id} className="relative">
              <Link
                href={`/groups/${group.id}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1F1F23]/50 p-4 transition-all duration-200 hover:bg-[#2a2a2e]"
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingId(editingId === group.id ? null : group.id);
                      }}
                      className="group-menu p-2 hover:bg-white/5 rounded-full"
                    >
                      <MoreVertical className="h-5 w-5 text-white/70" />
                    </button>

                    {editingId === group.id && (
                      <div className="group-menu absolute right-0 top-full mt-2 w-48 rounded-lg border border-white/10 bg-[#1F1F23] py-1 shadow-lg z-10">
                        <Link
                          href={`/groups/${group.id}/edit`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Add navigation logic here
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/5"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Group
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteGroup(group.id);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#FF4444] hover:bg-white/5"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Group
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
