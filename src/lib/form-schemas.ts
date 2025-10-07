import { z } from 'zod';

// Step 1: Identificación (8 fields - includes name fields)
export const identificacionSchema = z.object({
  tipo_identificacion: z.string().nullable(),
  numero_identificacion: z.string().min(1, 'Campo requerido'),
  fecha_expedicion: z.string().nullable(),
  ciudad_expedicion: z.string().nullable(),
  primer_nombre: z.string().min(1, 'Campo requerido'),
  segundo_nombre: z.string().nullable(),
  primer_apellido: z.string().min(1, 'Campo requerido'),
  segundo_apellido: z.string().nullable(),
});

// Step 2: Información Personal (8 fields)
export const personalSchema = z.object({
  fecha_nacimiento: z.string().nullable(),
  pais_nacimiento: z.string().nullable(),
  departamento_nacimiento: z.string().nullable(),
  ciudad_nacimiento: z.string().nullable(),
  genero: z.string().nullable(),
  estado_civil: z.string().nullable(),
  nacionalidad: z.string().nullable(),
  segunda_nacionalidad: z.string().nullable(),
});

// Step 3: Información de Contacto (7 fields)
export const contactSchema = z.object({
  correo_electronico: z.string().email('Correo electrónico inválido').nullable().or(z.literal('')),
  celular: z.string().nullable(),
  direccion_residencia: z.string().nullable(),
  pais_residencia: z.string().nullable(),
  departamento_residencia: z.string().nullable(),
  ciudad_residencia: z.string().nullable(),
  codigo_postal: z.string().nullable(),
});

// Step 4: Información Laboral (7 fields)
export const employmentSchema = z.object({
  ocupacion: z.string().nullable(),
  tipo_vinculacion_laboral: z.string().nullable(),
  empresa: z.string().nullable(),
  cargo: z.string().nullable(),
  direccion_laboral: z.string().nullable(),
  descripcion_ciiu: z.string().nullable(),
  codigo_ciiu: z.string().nullable(),
});

// Step 5: Información Financiera (5 fields)
export const financialSchema = z.object({
  total_activos: z.number().nullable().or(z.string().transform(val => val === '' ? null : Number(val))),
  total_pasivos: z.number().nullable().or(z.string().transform(val => val === '' ? null : Number(val))),
  total_ingresos_mensuales: z.number().nullable().or(z.string().transform(val => val === '' ? null : Number(val))),
  total_egresos_mensuales: z.number().nullable().or(z.string().transform(val => val === '' ? null : Number(val))),
  total_otros_ingresos: z.number().nullable().or(z.string().transform(val => val === '' ? null : Number(val))),
});

// Step 6: Información de Cumplimiento (8 fields) with Conditional Validation
export const complianceSchema = z.object({
  pep: z.boolean().default(false),
  familiar_pep: z.boolean().default(false),
  obligado_tributar_usa: z.boolean().default(false),
  obligado_tributar_otros_paises: z.boolean().default(false),
  realiza_operaciones_moneda_extranjera: z.boolean().default(false),
  recursos_dependen_tercero: z.boolean().default(false),
  recurso: z.string().nullable(),
  valor_recurso: z.number().nullable().or(z.string().transform(val => val === '' ? null : Number(val))),
}).refine(
  (data) => !data.recursos_dependen_tercero || (!!data.recurso && data.recurso.trim() !== ''),
  {
    message: 'Especifique el recurso cuando depende de tercero',
    path: ['recurso'],
  }
);

// Combined schema for final submission
export const clientFormSchema = identificacionSchema
  .merge(personalSchema)
  .merge(contactSchema)
  .merge(employmentSchema)
  .merge(financialSchema)
  .merge(complianceSchema);

// Export array of step schemas for validation
export const stepSchemas = [
  identificacionSchema,
  personalSchema,
  contactSchema,
  employmentSchema,
  financialSchema,
  complianceSchema,
];

// Step titles in Spanish
export const STEP_TITLES = [
  'Identificación',
  'Información Personal',
  'Información de Contacto',
  'Información Laboral',
  'Información Financiera',
  'Información de Cumplimiento',
  'Revisión',
];

// Select options constants
export const TIPO_IDENTIFICACION_OPTIONS = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'NIT', label: 'NIT' },
  { value: 'Pasaporte', label: 'Pasaporte' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
];

export const GENERO_OPTIONS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Otro', label: 'Otro' },
];

export const ESTADO_CIVIL_OPTIONS = [
  { value: 'Soltero', label: 'Soltero(a)' },
  { value: 'Casado', label: 'Casado(a)' },
  { value: 'Unión Libre', label: 'Unión Libre' },
  { value: 'Divorciado', label: 'Divorciado(a)' },
  { value: 'Viudo', label: 'Viudo(a)' },
];

export const TIPO_VINCULACION_OPTIONS = [
  { value: 'Empleado', label: 'Empleado' },
  { value: 'Independiente', label: 'Independiente' },
  { value: 'Pensionado', label: 'Pensionado' },
  { value: 'Rentista', label: 'Rentista de capital' },
];
