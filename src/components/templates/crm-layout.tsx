'use client';

import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
} from '@/components/ui/sidebar';
import Header from '@/components/molecules/header';
import SidebarNav from '@/components/molecules/sidebar-nav';
import AIChatTrigger from '@/components/molecules/ai-chat-trigger';
import ChatPanel from '@/components/organisms/chat-panel';

interface CRMLayoutProps {
  children: React.ReactNode;
}

export default function CRMLayout({ children }: CRMLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" data-testid="crm-layout">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">E</span>
              </div>
              <span className="font-semibold">EQUÁNIME</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarNav />
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              CRM v1.0.0
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />

          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>

        <AIChatTrigger onClick={() => setIsChatOpen(true)} />
        <ChatPanel isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
      </div>
    </SidebarProvider>
  );
}