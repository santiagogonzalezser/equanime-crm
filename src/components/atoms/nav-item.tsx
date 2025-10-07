'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NavItemProps {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  className?: string;
}

export default function NavItem({ title, href, icon: Icon, badge, className }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{title}</span>
      {badge && (
        <Badge variant="secondary" className="ml-auto text-xs">
          {badge}
        </Badge>
      )}
    </Link>
  );
}