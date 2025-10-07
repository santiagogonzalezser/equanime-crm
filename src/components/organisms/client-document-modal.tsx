'use client';

import * as React from 'react';
import { Download, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ClientDocumentSection } from '@/components/molecules/client-document-section';
import { generateClientPDF } from '@/lib/pdf-generator';
import type { Client } from '@/types';

interface ClientDocumentModalProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Field groups matching pdf-generator.ts and form-schemas.ts structure
const FIELD_GROUPS = {
  Identificación: [
    { key: 'tipo_identificacion' as keyof Client, label: 'Tipo de Identificación' },
    { key: 'numero_identificacion' as keyof Client, label: 'Número de Identificación' },
    { key: 'fecha_expedicion' as keyof Client, label: 'Fecha de Expedición' },
    { key: 'ciudad_expedicion' as keyof Client, label: 'Ciudad de Expedición' },
    { key: 'primer_nombre' as keyof Client, label: 'Primer Nombre' },
    { key: 'segundo_nombre' as keyof Client, label: 'Segundo Nombre' },
    { key: 'primer_apellido' as keyof Client, label: 'Primer Apellido' },
    { key: 'segundo_apellido' as keyof Client, label: 'Segundo Apellido' },
  ],
  'Información Personal': [
    { key: 'fecha_nacimiento' as keyof Client, label: 'Fecha de Nacimiento' },
    { key: 'pais_nacimiento' as keyof Client, label: 'País de Nacimiento' },
    { key: 'departamento_nacimiento' as keyof Client, label: 'Departamento de Nacimiento' },
    { key: 'ciudad_nacimiento' as keyof Client, label: 'Ciudad de Nacimiento' },
    { key: 'genero' as keyof Client, label: 'Género' },
    { key: 'estado_civil' as keyof Client, label: 'Estado Civil' },
    { key: 'nacionalidad' as keyof Client, label: 'Nacionalidad' },
    { key: 'segunda_nacionalidad' as keyof Client, label: 'Segunda Nacionalidad' },
  ],
  'Información de Contacto': [
    { key: 'correo_electronico' as keyof Client, label: 'Correo Electrónico' },
    { key: 'celular' as keyof Client, label: 'Celular' },
    { key: 'direccion_residencia' as keyof Client, label: 'Dirección de Residencia' },
    { key: 'pais_residencia' as keyof Client, label: 'País de Residencia' },
    { key: 'departamento_residencia' as keyof Client, label: 'Departamento de Residencia' },
    { key: 'ciudad_residencia' as keyof Client, label: 'Ciudad de Residencia' },
    { key: 'codigo_postal' as keyof Client, label: 'Código Postal' },
  ],
  'Información Laboral': [
    { key: 'ocupacion' as keyof Client, label: 'Ocupación' },
    { key: 'tipo_vinculacion_laboral' as keyof Client, label: 'Tipo de Vinculación Laboral' },
    { key: 'empresa' as keyof Client, label: 'Empresa' },
    { key: 'cargo' as keyof Client, label: 'Cargo' },
    { key: 'direccion_laboral' as keyof Client, label: 'Dirección Laboral' },
    { key: 'descripcion_ciiu' as keyof Client, label: 'Descripción CIIU' },
    { key: 'codigo_ciiu' as keyof Client, label: 'Código CIIU' },
  ],
  'Información Financiera': [
    { key: 'total_activos' as keyof Client, label: 'Total Activos' },
    { key: 'total_pasivos' as keyof Client, label: 'Total Pasivos' },
    { key: 'total_ingresos_mensuales' as keyof Client, label: 'Total Ingresos Mensuales' },
    { key: 'total_egresos_mensuales' as keyof Client, label: 'Total Egresos Mensuales' },
    { key: 'total_otros_ingresos' as keyof Client, label: 'Total Otros Ingresos' },
  ],
  'Información de Cumplimiento': [
    { key: 'pep' as keyof Client, label: 'Persona Expuesta Políticamente (PEP)' },
    { key: 'familiar_pep' as keyof Client, label: 'Familiar de PEP' },
    { key: 'obligado_tributar_usa' as keyof Client, label: 'Obligado a Tributar en USA' },
    { key: 'obligado_tributar_otros_paises' as keyof Client, label: 'Obligado a Tributar en Otros Países' },
    { key: 'realiza_operaciones_moneda_extranjera' as keyof Client, label: 'Realiza Operaciones en Moneda Extranjera' },
    { key: 'recursos_dependen_tercero' as keyof Client, label: 'Recursos Dependen de Tercero' },
    { key: 'recurso' as keyof Client, label: 'Especifique el Recurso' },
    { key: 'valor_recurso' as keyof Client, label: 'Valor del Recurso' },
  ],
};

/**
 * ClientDocumentModal - Organism component
 *
 * Displays a modal dialog with complete client information organized by sections.
 * Includes functionality to download the client data as a PDF.
 *
 * @example
 * <ClientDocumentModal
 *   client={clientData}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 */
export function ClientDocumentModal({
  client,
  open,
  onOpenChange,
}: ClientDocumentModalProps) {
  const handleDownloadPDF = () => {
    if (!client) return;
    generateClientPDF(client);
  };

  if (!client) return null;

  // Build client full name for header
  const clientName = [
    client.primer_nombre,
    client.segundo_nombre,
    client.primer_apellido,
    client.segundo_apellido,
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Sin nombre';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <DialogTitle className="text-xl">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span>Información del Cliente</span>
                </div>
              </DialogTitle>
              <DialogDescription className="text-base font-medium text-foreground">
                {clientName}
              </DialogDescription>
              {client.numero_identificacion && (
                <DialogDescription className="text-sm">
                  {client.tipo_identificacion || 'ID'}: {client.numero_identificacion}
                </DialogDescription>
              )}
            </div>

            {/* Download PDF Button */}
            <Button
              onClick={handleDownloadPDF}
              size="sm"
              variant="outline"
              className="shrink-0"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </DialogHeader>

        <Separator />

        {/* Scrollable content area */}
        <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
          <div className="space-y-6 pb-6">
            {Object.entries(FIELD_GROUPS).map(([groupTitle, fields], index) => (
              <React.Fragment key={groupTitle}>
                <ClientDocumentSection
                  title={groupTitle}
                  fields={fields.map((field) => ({
                    label: field.label,
                    value: client[field.key],
                  }))}
                />
                {/* Add separator between sections, but not after the last one */}
                {index < Object.keys(FIELD_GROUPS).length - 1 && (
                  <Separator className="my-6" />
                )}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
