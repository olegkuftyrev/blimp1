'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface ConditionalSidebarProps {
  children: React.ReactNode;
}

export function ConditionalSidebar({ children }: ConditionalSidebarProps) {
  const pathname = usePathname();
  
  // Define which pages should have sidebar
  const shouldShowSidebar = pathname.startsWith('/profile') || pathname.startsWith('/recipe-book');
  
  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex flex-1 w-full">
        <Suspense fallback={<div className="w-64 bg-background border-r" />}>
          <AppSidebar />
        </Suspense>
        <div className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
            <SidebarTrigger className="-ml-1 hover:bg-accent" />
            <div className="flex-1" />
          </div>
          {/* Content is now positioned correctly by the main element's pt-16 */}
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
