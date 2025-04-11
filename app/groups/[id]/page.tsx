"use client";

import { GroupInfoHeader } from "@/components/group-info-header";
import { useWallet } from "@/hooks/useWallet";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SettleDebtsModal } from "@/components/settle-debts-modal";
import { AddMemberModal } from "@/components/add-member-modal";
import { useGetGroupById } from "@/features/groups/hooks/use-create-group";
import { AddExpenseModal } from "@/components/add-expense-modal";

import { useAuthStore } from "@/stores/authStore";
import { useGetExpenses } from "@/features/expenses/hooks/use-create-expense";
import { Loader2, Plus, Settings, Users, Clock, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GroupDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuthStore();
  const groupId = params.id;
  const { data: group, isLoading } = useGetGroupById(groupId);
  const { address } = useWallet();
  const router = useRouter();
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "splits" | "activity">(
    "splits"
  );

  // State for group settings form
  const [groupSettings, setGroupSettings] = useState({
    name: "",
    currency: "ETH",
    lockPrice: true,
    memberEmail: "",
  });

  // Initialize settings from group data when it loads
  useEffect(() => {
    if (group) {
      setGroupSettings((prev) => ({
        ...prev,
        name: group.name,
        currency: group.defaultCurrency || "ETH",
      }));
    }
  }, [group]);

  // Handle delete group action
  const handleDeleteGroup = () => {
    // Implement delete group functionality
    toast.success("Group deleted successfully");
    router.push("/groups");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-white/50" />
          <p className="text-mobile-base sm:text-base text-white/70">
            Loading group details...
          </p>
        </div>
      </div>
    );
  }

  if (!group) return null;
  if (!user) return null;

  const expenses = group?.expenses;

  return (
    <div className="w-full">
      <GroupInfoHeader
        groupId={params.id}
        onSettleClick={() => setIsSettleModalOpen(true)}
        onAddExpenseClick={() => setIsAddExpenseModalOpen(true)}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        group={group}
      />

      <div className="bg-[#101012] rounded-xl sm:rounded-3xl min-h-[calc(100vh-200px)]">
        {/* Tabs */}
        <div className="flex px-3 sm:px-4 pt-3 sm:pt-4 pb-2 gap-1 sm:gap-2 overflow-x-auto">
          <button
            className={`px-4 sm:px-6 py-1.5 sm:py-2 text-mobile-base sm:text-lg font-medium transition-colors rounded-full ${
              activeTab === "splits"
                ? "bg-[#333] text-white"
                : "text-white/60 hover:text-white/80"
            }`}
            onClick={() => setActiveTab("splits")}
          >
            Splits
          </button>
          <button
            className={`px-4 sm:px-6 py-1.5 sm:py-2 text-mobile-base sm:text-lg font-medium transition-colors rounded-full ${
              activeTab === "activity"
                ? "bg-[#333] text-white"
                : "text-white/60 hover:text-white/80"
            }`}
            onClick={() => setActiveTab("activity")}
          >
            Activity
          </button>
          <button
            className={`px-4 sm:px-6 py-1.5 sm:py-2 text-mobile-base sm:text-lg font-medium transition-colors rounded-full ${
              activeTab === "members"
                ? "bg-[#333] text-white"
                : "text-white/60 hover:text-white/80"
            }`}
            onClick={() => setActiveTab("members")}
          >
            Members
          </button>

          {/* Add Member Button - Always visible now */}
          <div className="ml-auto flex items-center">
            <button
              onClick={() => {
                setIsAddingMember(true);
                setIsAddMemberModalOpen(true);
              }}
              disabled={isAddingMember}
              className="flex items-center justify-center gap-1 sm:gap-2 rounded-full text-white hover:bg-white/5 h-8 sm:h-10 px-3 sm:px-4 text-mobile-sm sm:text-base transition-colors"
            >
              <Image
                alt="Add Member"
                src="/plus-sign-circle.svg"
                width={14}
                height={14}
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
              <span className="text-mobile-sm sm:text-base">Add Member</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === "members" && (
            <div className="space-y-3 sm:space-y-4">
              {group.groupUsers.map((member) => {
                const balances = group?.groupBalances.filter(
                  (balance) => balance.userId === member.user.id
                );
                const owedBalance = balances?.filter(
                  (balance) => balance.amount > 0
                );
                const oweBalance = balances?.filter(
                  (balance) => balance.amount < 0
                );
                const owed = Math.abs(
                  owedBalance?.reduce(
                    (sum, balance) => sum + balance.amount,
                    0
                  ) || 0
                );
                const owe = Math.abs(
                  oweBalance?.reduce(
                    (sum, balance) => sum + balance.amount,
                    0
                  ) || 0
                );

                return (
                  <div
                    key={member.user.id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full">
                        <Image
                          src={
                            member.user.image ||
                            `https://api.dicebear.com/9.x/identicon/svg?seed=${member.user.id}`
                          }
                          alt={member.user.name || "User"}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            console.error(
                              `Error loading image for user ${member.user.id}`
                            );
                            const target = e.target as HTMLImageElement;
                            target.src = `https://api.dicebear.com/9.x/identicon/svg?seed=${member.user.id}`;
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-mobile-base sm:text-lg font-medium text-white">
                          {member.user.name}
                        </p>
                        <p className="text-mobile-sm sm:text-base text-white/60">
                          {member.user.email}
                        </p>
                      </div>
                    </div>

                    {member.user.id !== user?.id && (
                      <div>
                        <button
                          className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-white/5"
                          aria-label="Remove member"
                        >
                          <Trash2 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "splits" && (
            <div className="space-y-3 sm:space-y-4">
              {group.groupUsers.map((member) => {
                const balances = group?.groupBalances.filter(
                  (balance) => balance.userId === member.user.id
                );
                const owedBalance = balances?.filter(
                  (balance) => balance.amount > 0
                );
                const oweBalance = balances?.filter(
                  (balance) => balance.amount < 0
                );
                const owed = Math.abs(
                  owedBalance?.reduce(
                    (sum, balance) => sum + balance.amount,
                    0
                  ) || 0
                );
                const owe = Math.abs(
                  oweBalance?.reduce(
                    (sum, balance) => sum + balance.amount,
                    0
                  ) || 0
                );

                // Skip users that have no debt relationship
                if (owed === 0 && owe === 0 && member.user.id !== user?.id) {
                  return null;
                }

                // Determine if this is the current user or someone else
                const isCurrentUser = member.user.id === user?.id;
                // Only show the current user if they have debts to settle
                if (isCurrentUser && owed === 0 && owe === 0) {
                  return null;
                }

                return (
                  <div
                    key={member.user.id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full">
                        <Image
                          src={
                            member.user.image ||
                            `https://api.dicebear.com/9.x/identicon/svg?seed=${member.user.id}`
                          }
                          alt={member.user.name || "User"}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            console.error(
                              `Error loading image for user ${member.user.id}`
                            );
                            const target = e.target as HTMLImageElement;
                            target.src = `https://api.dicebear.com/9.x/identicon/svg?seed=${member.user.id}`;
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-mobile-base sm:text-lg font-medium text-white">
                          {isCurrentUser ? "You" : member.user.name}
                        </p>

                        {/* Only one of these will show based on the balance direction */}
                        {owed > 0 && !isCurrentUser && (
                          <p className="text-mobile-sm sm:text-base text-white/70">
                            Owes you{" "}
                            <span className="text-[#53e45d]">
                              ${owed.toFixed(2)}
                            </span>
                          </p>
                        )}

                        {owe > 0 && !isCurrentUser && (
                          <p className="text-mobile-sm sm:text-base text-white/70">
                            You owe{" "}
                            <span className="text-[#FF4444]">
                              ${owe.toFixed(2)}
                            </span>
                          </p>
                        )}

                        {isCurrentUser && owed > 0 && (
                          <p className="text-mobile-sm sm:text-base text-white/70">
                            Owes you{" "}
                            <span className="text-[#53e45d]">
                              ${owed.toFixed(2)}
                            </span>
                          </p>
                        )}

                        {isCurrentUser && owe > 0 && (
                          <p className="text-mobile-sm sm:text-base text-white/70">
                            You owe{" "}
                            <span className="text-[#FF4444]">
                              ${owe.toFixed(2)}
                            </span>
                          </p>
                        )}

                        {owed === 0 && owe === 0 && (
                          <p className="text-mobile-sm sm:text-base text-white/70">
                            No Payment Requirement
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCurrentUser && (
                        <div className="flex items-center gap-2">
                          {owed > 0 && (
                            <button className="flex items-center justify-center gap-1 sm:gap-2 rounded-full border border-white/80 text-white h-8 sm:h-10 px-3 sm:px-4 text-mobile-sm sm:text-sm hover:bg-white/5 transition-colors">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">
                                Send a Reminder
                              </span>
                            </button>
                          )}

                          {owe > 0 && (
                            <>
                              <button
                                className="flex items-center justify-center gap-1 sm:gap-2 rounded-full border border-white/80 text-white h-8 sm:h-10 px-3 sm:px-4 text-mobile-sm sm:text-sm hover:bg-white/5 transition-colors"
                                onClick={() => {
                                  // Set the friend to settle with
                                  setIsSettleModalOpen(true);
                                }}
                              >
                                <Image
                                  src="/coins-dollar.svg"
                                  alt="Settle Debts"
                                  width={16}
                                  height={16}
                                  className="h-3 w-3 sm:h-4 sm:w-4"
                                />
                                <span className="hidden sm:inline">
                                  Settle Debts
                                </span>
                              </button>

                              <button
                                className="flex items-center justify-center gap-1 sm:gap-2 rounded-full border border-white/80 text-white h-8 sm:h-10 px-3 sm:px-4 text-mobile-sm sm:text-sm hover:bg-white/5 transition-colors"
                                onClick={() => {
                                  // Implementation for marking as paid would go here
                                  toast.success(
                                    `Marked payment to ${member.user.name} as paid`,
                                    {
                                      description:
                                        "This will be recorded in your activity.",
                                    }
                                  );
                                }}
                              >
                                <Image
                                  src="/checkmark-circle.svg"
                                  alt="Mark as Paid"
                                  width={16}
                                  height={16}
                                  className="h-3 w-3 sm:h-4 sm:w-4"
                                />
                                <span className="hidden sm:inline">
                                  Mark as Paid
                                </span>
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      <button
                        className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-white/5 ml-1 sm:ml-2"
                        onClick={() => {
                          // Implementation for removing the split
                          toast.success(
                            `Removed ${
                              isCurrentUser ? "your" : member.user.name + "'s"
                            } payment requirement`
                          );
                        }}
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-white/70" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-mobile-lg sm:text-xl font-medium text-white mb-3 sm:mb-4">
                Recent Activity
              </h3>

              {expenses && expenses.length > 0 ? (
                expenses.map((expense, index) => {
                  const paidBy = group?.groupUsers.find(
                    (user) => user.user.id === expense.paidBy
                  )?.user;

                  if (!paidBy) return null;

                  return (
                    <div
                      key={index}
                      className="p-3 sm:p-4 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 overflow-hidden rounded-full">
                          <Image
                            src={
                              paidBy.image ||
                              `https://api.dicebear.com/9.x/identicon/svg?seed=${paidBy.id}`
                            }
                            alt={paidBy.name || "User"}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error(
                                `Error loading image for user ${paidBy.id}`
                              );
                              const target = e.target as HTMLImageElement;
                              target.src = `https://api.dicebear.com/9.x/identicon/svg?seed=${paidBy.id}`;
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-mobile-base sm:text-base text-white">
                            <span className="font-medium">
                              {paidBy.id === user?.id ? "You" : paidBy.name}
                            </span>{" "}
                            added expense "{expense.name}"
                          </p>
                          <p className="text-mobile-xs sm:text-sm text-white/60">
                            {new Date(expense.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-mobile-base sm:text-base text-white font-medium">
                        ${expense.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 sm:py-12 text-mobile-base sm:text-base text-white/60">
                  No activity yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SettleDebtsModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        balances={group.groupBalances}
        groupId={params.id}
        members={group.groupUsers.map((user) => user.user)}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false);
          setIsAddingMember(false);
        }}
        groupId={params.id}
      />

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        groupId={params.id}
        members={group.groupUsers.map((member) => member.user)}
      />

      {/* Group Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 h-screen w-screen">
          <div
            className="fixed inset-0 bg-black/80 brightness-50"
            onClick={() => setIsSettingsModalOpen(false)}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[450px] max-h-[90vh] overflow-auto">
            <div className="relative z-10 rounded-[20px] bg-black p-4 sm:p-6 border border-white/20">
              <h2 className="text-mobile-xl sm:text-2xl font-medium text-white mb-4 sm:mb-6">
                Group settings
              </h2>

              <form className="space-y-4 sm:space-y-6">
                <div>
                  <label className="text-mobile-base sm:text-base text-white mb-1 sm:mb-2 block">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupSettings.name}
                    onChange={(e) =>
                      setGroupSettings((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="New Split Group"
                    className="w-full h-10 sm:h-12 px-4 rounded-lg bg-[#17171A] text-white border-none focus:outline-none focus:ring-1 focus:ring-white/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-mobile-base sm:text-base text-white mb-1 sm:mb-2 block">
                    Choose Payment Token
                  </label>
                  <Select
                    value={groupSettings.currency}
                    onValueChange={(value) =>
                      setGroupSettings((prev) => ({
                        ...prev,
                        currency: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full h-10 sm:h-12 bg-[#17171A] text-white border-none focus:ring-1 focus:ring-white/20">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#17171A] border-white/10">
                      <SelectItem
                        value="ETH"
                        className="text-white hover:bg-white/10"
                      >
                        ETH
                      </SelectItem>
                      <SelectItem
                        value="USDT"
                        className="text-white hover:bg-white/10"
                      >
                        USDT
                      </SelectItem>
                      <SelectItem
                        value="USD"
                        className="text-white hover:bg-white/10"
                      >
                        USD
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Lock price toggle */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-mobile-xs sm:text-sm text-white/70">
                      {groupSettings.currency === "ETH" &&
                        "Lock price at 1 ETH = $1880.89"}
                      {groupSettings.currency === "USDT" &&
                        "Lock price at 1 USDT = $1.00"}
                      {groupSettings.currency === "USD" &&
                        "Lock price at 1 USD = $1.00"}
                    </span>
                    <div
                      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                        groupSettings.lockPrice ? "bg-white/30" : "bg-[#333]"
                      }`}
                      onClick={() =>
                        setGroupSettings((prev) => ({
                          ...prev,
                          lockPrice: !prev.lockPrice,
                        }))
                      }
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          groupSettings.lockPrice
                            ? "translate-x-6"
                            : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 sm:pt-6">
                  <label className="text-mobile-base sm:text-base text-white mb-1 sm:mb-2 block">
                    Invite members
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={groupSettings.memberEmail}
                      onChange={(e) =>
                        setGroupSettings((prev) => ({
                          ...prev,
                          memberEmail: e.target.value,
                        }))
                      }
                      placeholder="me@email.com"
                      className="flex-1 h-10 sm:h-12 px-4 rounded-lg bg-[#17171A] text-white border-none focus:outline-none focus:ring-1 focus:ring-white/20"
                    />
                    <button
                      type="button"
                      className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white"
                    >
                      <Image
                        src="/plus-sign-circle.svg"
                        alt="Add"
                        width={16}
                        height={16}
                        className="w-4 h-4 sm:w-5 sm:h-5 invert"
                      />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 sm:h-12 rounded-full bg-white text-black text-mobile-base sm:text-base font-medium hover:bg-white/90 transition-colors mt-4 sm:mt-6"
                >
                  Save changes
                </button>

                <button
                  type="button"
                  onClick={handleDeleteGroup}
                  className="w-full text-center text-red-500 text-mobile-base sm:text-base py-2"
                >
                  Delete Group
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
