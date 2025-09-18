'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface ConditionalSidebarProps {
  children: React.ReactNode;
}

export function ConditionalSidebar({ children }: ConditionalSidebarProps) {
  const pathname = usePathname();
  
  // Define which pages should have sidebar
  const shouldShowSidebar = pathname.startsWith('/profile');
  
  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex flex-1 w-full">
        <AppSidebar />
        <div className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
