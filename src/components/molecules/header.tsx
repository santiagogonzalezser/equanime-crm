'use client';

import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header
      className={cn(
        'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'sticky top-0 z-50',
        className
      )}
    >
      <div className="flex h-20 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <SidebarTrigger aria-label="Toggle sidebar" />
          <h1 className="text-2xl font-bold text-foreground">EQUÁNIME CRM</h1>
        </div>
        <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2">
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
}
