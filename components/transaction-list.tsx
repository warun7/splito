import { Check, X } from "lucide-react";
import Image from "next/image";

type Transaction = {
  id: string;
  user: {
    name: string;
    image: string;
  };
  amount: number;
  type: "owe" | "owed";
  date: string;
};

type TransactionListProps = {
  transactions: Transaction[];
};

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center text-white/70 py-8">No transactions yet</div>
    );
  }

  return (
    <div className="space-y-6">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={transaction.user.image}
              alt={transaction.user.name}
              className="h-full w-full object-cover"
              width={48}
              height={48}
            />
            <div>
              <p className="font-medium text-white">{transaction.user.name}</p>
              <p className="text-sm text-white/70">
                {transaction.type === "owe" ? "you owe" : "owes you"}
              </p>
            </div>
          </div>
          <p
            className={
              transaction.type === "owe" ? "text-[#FF4444]" : "text-[#67B76C]"
            }
          >
            ${transaction.amount.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}
