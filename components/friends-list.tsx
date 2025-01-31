"use client";

import Image from "next/image";
import { useState } from "react";

type Friend = {
  id: string;
  name: string;
  email: string;
  address: string;
  image: string;
  balance: {
    amount: number;
    type: "owes_you" | "you_owe";
  };
};

const mockFriends: Friend[] = [
  {
    id: "1",
    name: "Mike",
    email: "email/contact",
    address: "<address>",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    balance: {
      amount: 167.0,
      type: "you_owe",
    },
  },
  {
    id: "2",
    name: "Harris",
    email: "email/contact",
    address: "<address>",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Harris",
    balance: {
      amount: 54.5,
      type: "owes_you",
    },
  },
  {
    id: "3",
    name: "Tyson",
    email: "email/contact",
    address: "<address>",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tyson",
    balance: {
      amount: 90.0,
      type: "you_owe",
    },
  },
  {
    id: "4",
    name: "Kamala",
    email: "email/contact",
    address: "<address>",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kamala",
    balance: {
      amount: 35.0,
      type: "owes_you",
    },
  },
];

export function FriendsList() {
  const [friends] = useState<Friend[]>(mockFriends);

  return (
    <div className="space-y-3 lg:space-y-4">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 lg:gap-8 rounded-xl bg-zinc-950 p-3 lg:p-4 pointer-events-none"
        >
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="h-12 w-12 lg:h-20 lg:w-20 overflow-hidden rounded-full">
              <Image
                src={friend.image}
                alt={friend.name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-lg lg:text-xl font-semibold text-white">
                {friend.name}
              </p>
              <p className="text-xs lg:text-sm text-white/70">{friend.email}</p>
            </div>
          </div>

          <div className="text-center text-sm lg:text-lg text-white/50">
            {friend.address}
          </div>

          <div className="text-right min-w-[80px] lg:min-w-[100px]">
            <p className="text-lg lg:text-lg text-white/70">
              {friend.balance.type === "owes_you" ? "owes you" : "you owe"}
            </p>
            <p
              className={
                friend.balance.type === "owes_you"
                  ? "text-[#41B66B] font-semibold text-lg lg:text-xl"
                  : "text-[#DA0000] font-semibold text-lg lg:text-xl"
              }
            >
              ${friend.balance.amount.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
