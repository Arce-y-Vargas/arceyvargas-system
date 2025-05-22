"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { logout } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

export function DashboardHeader() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();

  if (!pathname.startsWith("/dashboard")) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <header className="flex h-16 justify-between items-center border-b px-4 lg:px-6">
      <SidebarTrigger
        className={cn("h-10 w-10 p-3 z-0", isMobile ? "left-0" : "relative")}
      />
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
