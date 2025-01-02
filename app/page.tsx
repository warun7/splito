"use client";

import { TransactionList } from "@/components/transaction-list";
import { TransactionRequests } from "@/components/transaction-requests";
import { GroupsList } from "@/components/groups-list";
import { useWallet } from "@/hooks/useWallet";
import { useGroups } from "@/stores/groups";
import {
  calculateBalances,
  getTransactionsFromGroups,
} from "@/utils/calculations";

export default function Page() {
  const { isConnected, balance, address } = useWallet();
  const { groups } = useGroups();

  const { totalOwed, totalOwe, netBalance } = calculateBalances(
    groups,
    address
  );
  const transactions = getTransactionsFromGroups(groups, address);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <div className="mb-6 space-y-2">
            <h2 className="text-xl lg:text-2xl font-semibold text-white">
              {netBalance < 0 ? (
                <>
                  Overall, you owe{" "}
                  <span className="text-[#FF4444]">
                    ${Math.abs(netBalance).toFixed(2)}
                  </span>
                </>
              ) : netBalance > 0 ? (
                <>
                  Overall, you are owed{" "}
                  <span className="text-[#67B76C]">
                    ${netBalance.toFixed(2)}
                  </span>
                </>
              ) : (
                <>You're all settled up!</>
              )}
            </h2>
            {isConnected && (
              <div className="mt-4 rounded-lg border border-white/10 bg-[#1F1F23]/50 p-4">
                <p className="text-base lg:text-lg text-white">
                  Wallet Balance:{" "}
                  <span className="font-medium">{balance} ETH</span>
                </p>
              </div>
            )}
          </div>
          <TransactionList transactions={transactions} />
        </div>
        <GroupsList />
      </div>
      <div>
        <TransactionRequests />
      </div>
    </div>
  );
}
