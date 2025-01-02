import { type Group } from "@/stores/groups";

export function calculateBalances(groups: Group[], userAddress: string | null) {
  if (!userAddress) return { totalOwed: 0, totalOwe: 0, netBalance: 0 };

  let totalOwed = 0;
  let totalOwe = 0;

  groups.forEach((group) => {
    if (group.paidBy === userAddress) {
      // If I paid, sum up what others owe me from the debts
      const othersOweMe = group.debts.reduce(
        (sum, debt) => sum + debt.amount,
        0
      );
      totalOwed += othersOweMe;
    } else {
      // If someone else paid, find what I owe them from the debts
      const myDebt = group.debts.find((debt) => debt.from === userAddress);
      if (myDebt) {
        totalOwe += myDebt.amount;
      }
    }
  });

  const netBalance = totalOwed - totalOwe;
  return { totalOwed, totalOwe, netBalance };
}

export function getTransactionsFromGroups(
  groups: Group[],
  userAddress: string | null
) {
  if (!userAddress) return [];

  const transactions: {
    id: string;
    user: { name: string; image: string };
    amount: number;
    type: "owe" | "owed";
    date: string;
  }[] = [];

  groups.forEach((group) => {
    if (group.paidBy === userAddress) {
      // Add transactions for people who owe me
      group.debts.forEach((debt) => {
        transactions.push({
          id: `${group.id}-${debt.from}`,
          user: {
            name: debt.from.slice(0, 6) + "..." + debt.from.slice(-4),
            image: "/placeholder-user.jpg",
          },
          amount: debt.amount,
          type: "owed",
          date: group.date,
        });
      });
    } else {
      // Add transaction for what I owe
      const myDebt = group.debts.find((debt) => debt.from === userAddress);
      if (myDebt) {
        transactions.push({
          id: `${group.id}-${myDebt.to}`,
          user: {
            name: group.paidBy.slice(0, 6) + "..." + group.paidBy.slice(-4),
            image: "/placeholder-user.jpg",
          },
          amount: myDebt.amount,
          type: "owe",
          date: group.date,
        });
      }
    }
  });

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
