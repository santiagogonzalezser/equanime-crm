'use client';

import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import Image from 'next/image';

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
        'border-b sticky top-0 z-50',
        className
      )}
      style={{ backgroundColor: '#6B6B6B' }}
    >
      <div className="flex h-20 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <SidebarTrigger aria-label="Toggle sidebar" className="text-white hover:text-white hover:bg-white/10" />
          <Image
            src="/logos/equanime.png"
            alt="Equánime CRM"
            width={180}
            height={45}
            priority
            className="h-auto w-auto max-h-10"
          />
        </div>
        <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2 text-white hover:text-white hover:bg-white/10">
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
}
