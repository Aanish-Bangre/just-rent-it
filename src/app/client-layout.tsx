'use client';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const geistSans = "var(--font-geist-sans)";
  const geistMono = "var(--font-geist-mono)";
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/setup-profile") || pathname.startsWith(`/items/[listingId]/checkout`);

  return (
    <div className={`${geistSans} ${geistMono} antialiased`}>
      {!isAuthPage ? (
        <SidebarProvider>
          <AppSidebar />
          <main>
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      ) : (
        <main>{children}</main>
      )}
    </div>
  );
} 