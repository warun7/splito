"use client";

import { GroupsList } from "@/components/groups-list";

export default function GroupsPage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-2xl font-semibold text-white">
          My Groups
        </h1>
      </div>
      <GroupsList />
    </div>
  );
}
