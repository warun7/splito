"use client";

import { useGroups, type Group } from "@/stores/groups";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/utils/animations";

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

  useEffect(() => {
    if (editingId) {
      const button = document.querySelector(
        `[data-group-id="${editingId}"] button`
      ) as HTMLElement;
      const dropdown = document.querySelector(
        `[data-group-id="${editingId}"] .group-menu`
      ) as HTMLElement;

      if (button && dropdown) {
        const buttonRect = button.getBoundingClientRect();
        dropdown.style.top = `${buttonRect.bottom + 8}px`;
        dropdown.style.left = `${buttonRect.right - dropdown.offsetWidth}px`;
      }
    }
  }, [editingId]);

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
    <motion.div
      className="py-12"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.h2 variants={slideUp} className="text-h2 text-white mb-6">
        Groups
      </motion.h2>
      <div className="space-y-4">
        {groups.map((group, index) => {
          const debtInfo = getMyDebtInfo(group);
          return (
            <motion.div
              key={group.id}
              variants={slideUp}
              className="relative z-0"
            >
              <Link
                href={`/groups/${group.id}`}
                className="flex items-center justify-between rounded-xl bg-zinc-950 p-4 transition-all duration-300 hover:bg-[#1a1a1c] relative group"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  e.currentTarget.style.background = `radial-gradient(1000px circle at ${x}px ${y}px, rgba(255,255,255,0.05), transparent 40%)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#09090b";
                  e.currentTarget.style.transition = "background 0.3s ease";
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={group.image || "/group_icon_placeholder.png"}
                      alt={group.name}
                      className="h-full w-full object-cover"
                      width={48}
                      height={48}
                    />
                  </div>
                  <div>
                    <p className="text-body font-medium text-white">
                      {group.name}
                    </p>
                    <p className="text-body-sm text-white/70">
                      Created by {group.creator} • {group.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg text-white/70">
                      {debtInfo.type === "owed" ? "you are owed" : "you owe"}
                    </p>
                    <p
                      className={`text-body ${
                        debtInfo.type === "owed"
                          ? "text-[#67B76C]"
                          : "text-[#FF4444]"
                      }`}
                    >
                      ${debtInfo.amount.toFixed(2)}
                    </p>
                  </div>

                  <div className="relative" data-group-id={group.id}>
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
                      <div className="group-menu absolute right-0 top-[calc(100%+4px)] w-48 rounded-lg border border-white/10 bg-[#1F1F23] py-1 shadow-lg z-[100]">
                        <Link
                          href={`/groups/${group.id}/edit`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-body-sm text-white hover:bg-white/5"
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
                          className="flex w-full items-center gap-2 px-4 py-2 text-body-sm text-[#FF4444] hover:bg-white/5"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Group
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
