'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DataToggleProps {
  value: 'apartamentos' | 'clientes';
  onToggle: (value: 'apartamentos' | 'clientes') => void;
}

export default function DataToggle({ value, onToggle }: DataToggleProps) {
  const handleToggle = (checked: boolean) => {
    onToggle(checked ? 'clientes' : 'apartamentos');
  };

  return (
    <div className="flex items-center space-x-2">
      <Label
        htmlFor="data-toggle"
        className={`text-sm font-medium ${
          value === 'apartamentos' ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        Apartamentos
      </Label>
      <Switch
        id="data-toggle"
        checked={value === 'clientes'}
        onCheckedChange={handleToggle}
        aria-label="Toggle between Apartamentos and Clientes data"
      />
      <Label
        htmlFor="data-toggle"
        className={`text-sm font-medium ${
          value === 'clientes' ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        Clientes
      </Label>
    </div>
  );
}