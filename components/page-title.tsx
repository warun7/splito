"use client";

import { usePathname } from "next/navigation";

export function PageTitle() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname === "/") return "Overview";
    if (pathname === "/groups") return "Groups";
    if (pathname === "/create") return "Create";
    if (pathname.startsWith("/groups/") && pathname.endsWith("/edit"))
      return "Edit";
    return "Split Expenses";
  };

  return (
    <div className="mb-8">
      <h1 className="text-2xl lg:text-3xl font-semibold text-white mt-8">
        {getTitle()}
      </h1>
    </div>
  );
}
