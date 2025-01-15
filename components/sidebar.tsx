"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileMenu } from "@/contexts/mobile-menu";
import { UserProfile } from "@/components/user-profile";

const navigation = [
  { name: "Overview", href: "/", icon: Home },
  { name: "My Groups", href: "/groups", icon: Users },
  { name: "Create Group", href: "/create", icon: Plus },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useMobileMenu();
  const logo = "/logo.svg";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm min-[1025px]:hidden"
          onClick={close}
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 z-20 h-screen w-[280px] border-r border-white/10 bg-[#101012] transition-transform duration-300 min-[1025px]:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-8">
          <Link href="/" className="block" onClick={close}>
            <Image
              src={logo}
              alt="Logo"
              width={140}
              height={56}
              className="h-14 w-auto"
              priority
            />
          </Link>
        </div>

        <nav className="mt-16 space-y-6 px-8">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-4 text-[18px] font-medium text-white/80 transition-colors hover:text-white",
                  isActive && "text-white"
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={1.5} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="rounded-xl border border-white/10 bg-[#000]/50 p-4 backdrop-blur-sm">
            <UserProfile />
          </div>
        </div>
      </div>
    </>
  );
}
