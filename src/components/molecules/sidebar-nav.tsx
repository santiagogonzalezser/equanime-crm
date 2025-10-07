'use client';

import {
  BarChart3,
  Users,
  Settings,
  FileText,
  Mail,
  UserPlus
} from 'lucide-react';
import NavItem from '@/components/atoms/nav-item';
import { SidebarNavItem } from '@/types';

const navItems: SidebarNavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    title: 'Tablas',
    href: '/tables',
    icon: Users,
    badge: '5',
  },
  {
    title: 'Agregar Cliente',
    href: '/clientes/nuevo',
    icon: UserPlus,
  },
  {
    title: 'Reportes',
    href: '/reports',
    icon: FileText,
  },
  {
    title: 'Mensajes',
    href: '/messages',
    icon: Mail,
    badge: '3',
  },
  {
    title: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
];

export default function SidebarNav() {
  return (
    <nav className="flex flex-col space-y-1 p-2">
      {navItems.map((item) => (
        <NavItem
          key={item.href}
          title={item.title}
          href={item.href}
          icon={item.icon}
          badge={item.badge}
        />
      ))}
    </nav>
  );
}