'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataSelectorProps {
  value: 'apartamentos' | 'clientes';
  onToggle: (value: 'apartamentos' | 'clientes') => void;
}

export default function DataSelector({ value, onToggle }: DataSelectorProps) {
  return (
    <Select value={value} onValueChange={onToggle}>
      <SelectTrigger className="w-48 bg-white border-gray-300">
        <SelectValue placeholder="Select data type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apartamentos">Apartamentos</SelectItem>
        <SelectItem value="clientes">Clientes</SelectItem>
      </SelectContent>
    </Select>
  );
}