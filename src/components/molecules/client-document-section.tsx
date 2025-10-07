import * as React from 'react';
import { cn } from '@/lib/utils';

interface ClientDocumentSectionProps {
  title: string;
  fields: {
    label: string;
    value: string | number | boolean | null | undefined;
  }[];
  className?: string;
}

/**
 * Format a value for display in the document section
 * - null/undefined/empty → "-"
 * - boolean → "Sí" / "No"
 * - number → formatted with locale
 * - string → as is
 */
function formatValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  if (typeof value === 'number') {
    return value.toLocaleString('es-CO');
  }

  return String(value);
}

/**
 * ClientDocumentSection - Molecule component
 *
 * Displays a titled section with a list of labeled fields and their values.
 * Used within the client document modal to organize information by category
 * (e.g., "Identificación", "Información Personal", etc.)
 *
 * @example
 * <ClientDocumentSection
 *   title="Identificación"
 *   fields={[
 *     { label: 'Tipo de Identificación', value: 'CC' },
 *     { label: 'Número', value: '1234567890' }
 *   ]}
 * />
 */
export function ClientDocumentSection({
  title,
  fields,
  className,
}: ClientDocumentSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Section Title */}
      <h3 className="text-sm font-semibold text-foreground border-b pb-2">
        {title}
      </h3>

      {/* Fields Grid */}
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {fields.map((field, index) => (
          <div key={`${field.label}-${index}`} className="space-y-1">
            {/* Field Label */}
            <dt className="text-xs font-medium text-muted-foreground">
              {field.label}
            </dt>
            {/* Field Value */}
            <dd className="text-sm text-foreground break-words">
              {formatValue(field.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
