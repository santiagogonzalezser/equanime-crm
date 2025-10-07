export interface Client {
  id: string;
  // Identification
  tipo_identificacion: string | null;
  numero_identificacion: string | null;
  fecha_expedicion: string | null;
  ciudad_expedicion: string | null;

  // Personal Information
  primer_nombre: string | null;
  segundo_nombre: string | null;
  primer_apellido: string | null;
  segundo_apellido: string | null;
  fecha_nacimiento: string | null;
  pais_nacimiento: string | null;
  departamento_nacimiento: string | null;
  ciudad_nacimiento: string | null;
  genero: string | null;
  estado_civil: string | null;
  nacionalidad: string | null;
  segunda_nacionalidad: string | null;

  // Contact Information
  correo_electronico: string | null;
  celular: string | null;
  direccion_residencia: string | null;
  pais_residencia: string | null;
  departamento_residencia: string | null;
  ciudad_residencia: string | null;
  codigo_postal: string | null;

  // Employment
  ocupacion: string | null;
  tipo_vinculacion_laboral: string | null;
  empresa: string | null;
  cargo: string | null;
  direccion_laboral: string | null;
  descripcion_ciiu: string | null;
  codigo_ciiu: string | null;

  // Financial
  total_activos: number | null;
  total_pasivos: number | null;
  total_ingresos_mensuales: number | null;
  total_egresos_mensuales: number | null;
  total_otros_ingresos: number | null;

  // Compliance
  pep: boolean | null;
  familiar_pep: boolean | null;
  obligado_tributar_usa: boolean | null;
  obligado_tributar_otros_paises: boolean | null;
  realiza_operaciones_moneda_extranjera: boolean | null;
  recursos_dependen_tercero: boolean | null;
  recurso: string | null;
  valor_recurso: number | null;

  // Timestamps
  created_at: string | null;
  updated_at: string | null;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
  category?: string;
}

export interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ComponentType;
  badge?: string;
}