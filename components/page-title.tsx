"use client";

import { usePathname } from "next/navigation";

export function PageTitle() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname === "/") return "Overview";
    if (pathname === "/groups") return "Groups";
    if (pathname === "/create") return "Create";
    if (pathname === "/friends") return "Friends";
    if (pathname.startsWith("/groups/") && pathname.endsWith("/edit"))
      return "Edit";
    return "Group Overview";
  };

  return (
    <div className="mb-8">
      <h1 className="text-h1 text-white mb-10">{getTitle()}</h1>
    </div>
  );
}
