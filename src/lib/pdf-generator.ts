import jsPDF from 'jspdf';
import type { Client } from '@/types';

// Field groups matching form-schemas.ts structure
const FIELD_GROUPS = {
  'Identificación': [
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
 * Format a value for display in PDF
 * - null/undefined → "-"
 * - boolean → "Sí" / "No"
 * - number → formatted string
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
 * Generate PDF document for a client
 * Creates a searchable, text-based PDF with all client information
 */
export function generateClientPDF(client: Client): void {
  // Create A4 portrait document
  const doc = new jsPDF('p', 'mm', 'a4');

  // Header - Company branding
  doc.setFontSize(20);
  doc.text('EQUÁNIME CRM - Información del Cliente', 20, 20);

  // Client full name
  doc.setFontSize(14);
  const clientName = [
    client.primer_nombre,
    client.segundo_nombre,
    client.primer_apellido,
    client.segundo_apellido,
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Sin nombre';
  doc.text(clientName, 20, 30);

  let yPosition = 40;

  // Loop through field groups
  for (const [groupTitle, fields] of Object.entries(FIELD_GROUPS)) {
    // Section header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(groupTitle, 20, yPosition);
    yPosition += 7;

    // Fields
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    for (const { key, label } of fields) {
      const value = client[key];
      const formattedValue = formatValue(value);
      const text = `${label}: ${formattedValue}`;

      // Handle long text with splitTextToSize
      const lines = doc.splitTextToSize(text, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5;

      // Check page overflow, add new page if needed
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    }

    yPosition += 5; // Spacing between sections
  }

  // Generate filename
  const firstName = client.primer_nombre || 'sin_nombre';
  const lastName = client.primer_apellido || 'sin_apellido';
  const date = new Date().toISOString().split('T')[0];
  const filename = `cliente_${firstName}_${lastName}_${date}.pdf`;

  // Download PDF
  doc.save(filename);
}
