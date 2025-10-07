'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AIChatTriggerProps {
  onClick: () => void;
  className?: string;
}

export default function AIChatTrigger({ onClick, className }: AIChatTriggerProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'h-14 w-14 rounded-full shadow-lg',
        'bg-primary hover:bg-primary/90',
        'animate-pulse hover:animate-none',
        className
      )}
      aria-label="AI Agent"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}