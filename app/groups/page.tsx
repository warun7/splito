"use client";

import { GroupsList } from "@/components/groups-list";

export default function GroupsPage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-semibold text-white">
          My Groups
        </h1>
        <p className="mt-2 text-white/70">
          Manage and view all your expense groups
        </p>
      </div>
      <GroupsList />
    </div>
  );
}
