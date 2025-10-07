'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <Card
      className={cn('rounded-lg border shadow-sm', className)}
      role="region"
      aria-label={`${title} chart`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-0">
        <div className="h-[200px] w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}