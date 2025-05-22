"use client";

import { DashboardSidebar } from "@/layouts/Sidebar";
import { DashboardHeader } from "@/layouts/Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <div className="flex min-h-screen min-w-full flex-col">
          <div className="flex flex-1">
            <DashboardSidebar />
            <SidebarInset className="flex flex-col w-full">
              <DashboardHeader />
              <main className="flex-1 p-1 md:p-8  space-y-4">{children}</main>
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
