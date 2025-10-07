export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      apartamentos: {
        Row: {
          apartamento: number
          area_construida: number | null
          area_terraza: number | null
          cliente_id: string | null
          created_at: string | null
          cuota_inicial_pct: number | null
          cuota_inicial_valor: number | null
          cuota_mensual_mes1: number | null
          grupo: string | null
          id: string
          modelo: string | null
          saldo_contra_escrituracion: number | null
          saldo_inicial: number | null
          separacion: number | null
          valor_ac: number | null
          valor_mt2: number | null
          valor_mt2_terraza: number | null
          valor_terraza: number | null
          valor_total: number | null
          vendido: boolean | null
        }
        Insert: {
          apartamento: number
          area_construida?: number | null
          area_terraza?: number | null
          cliente_id?: string | null
          created_at?: string | null
          cuota_inicial_pct?: number | null
          cuota_inicial_valor?: number | null
          cuota_mensual_mes1?: number | null
          grupo?: string | null
          id?: string
          modelo?: string | null
          saldo_contra_escrituracion?: number | null
          saldo_inicial?: number | null
          separacion?: number | null
          valor_ac?: number | null
          valor_mt2?: number | null
          valor_mt2_terraza?: number | null
          valor_terraza?: number | null
          valor_total?: number | null
          vendido?: boolean | null
        }
        Update: {
          apartamento?: number
          area_construida?: number | null
          area_terraza?: number | null
          cliente_id?: string | null
          created_at?: string | null
          cuota_inicial_pct?: number | null
          cuota_inicial_valor?: number | null
          cuota_mensual_mes1?: number | null
          grupo?: string | null
          id?: string
          modelo?: string | null
          saldo_contra_escrituracion?: number | null
          saldo_inicial?: number | null
          separacion?: number | null
          valor_ac?: number | null
          valor_mt2?: number | null
          valor_mt2_terraza?: number | null
          valor_terraza?: number | null
          valor_total?: number | null
          vendido?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "apartamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cargo: string | null
          celular: string | null
          ciudad_expedicion: string | null
          ciudad_nacimiento: string | null
          ciudad_residencia: string | null
          codigo_ciiu: string | null
          codigo_postal: string | null
          correo_electronico: string | null
          created_at: string | null
          departamento_nacimiento: string | null
          departamento_residencia: string | null
          descripcion_ciiu: string | null
          direccion_laboral: string | null
          direccion_residencia: string | null
          empresa: string | null
          estado_civil: string | null
          familiar_pep: boolean | null
          fecha_expedicion: string | null
          fecha_nacimiento: string | null
          genero: string | null
          id: string
          nacionalidad: string | null
          numero_identificacion: string | null
          obligado_tributar_otros_paises: boolean | null
          obligado_tributar_usa: boolean | null
          ocupacion: string | null
          pais_nacimiento: string | null
          pais_residencia: string | null
          pep: boolean | null
          primer_apellido: string | null
          primer_nombre: string | null
          realiza_operaciones_moneda_extranjera: boolean | null
          recurso: string | null
          recursos_dependen_tercero: boolean | null
          segunda_nacionalidad: string | null
          segundo_apellido: string | null
          segundo_nombre: string | null
          tipo_identificacion: string | null
          tipo_vinculacion_laboral: string | null
          total_activos: number | null
          total_egresos_mensuales: number | null
          total_ingresos_mensuales: number | null
          total_otros_ingresos: number | null
          total_pasivos: number | null
          updated_at: string | null
          valor_recurso: number | null
        }
        Insert: {
          cargo?: string | null
          celular?: string | null
          ciudad_expedicion?: string | null
          ciudad_nacimiento?: string | null
          ciudad_residencia?: string | null
          codigo_ciiu?: string | null
          codigo_postal?: string | null
          correo_electronico?: string | null
          created_at?: string | null
          departamento_nacimiento?: string | null
          departamento_residencia?: string | null
          descripcion_ciiu?: string | null
          direccion_laboral?: string | null
          direccion_residencia?: string | null
          empresa?: string | null
          estado_civil?: string | null
          familiar_pep?: boolean | null
          fecha_expedicion?: string | null
          fecha_nacimiento?: string | null
          genero?: string | null
          id?: string
          nacionalidad?: string | null
          numero_identificacion?: string | null
          obligado_tributar_otros_paises?: boolean | null
          obligado_tributar_usa?: boolean | null
          ocupacion?: string | null
          pais_nacimiento?: string | null
          pais_residencia?: string | null
          pep?: boolean | null
          primer_apellido?: string | null
          primer_nombre?: string | null
          realiza_operaciones_moneda_extranjera?: boolean | null
          recurso?: string | null
          recursos_dependen_tercero?: boolean | null
          segunda_nacionalidad?: string | null
          segundo_apellido?: string | null
          segundo_nombre?: string | null
          tipo_identificacion?: string | null
          tipo_vinculacion_laboral?: string | null
          total_activos?: number | null
          total_egresos_mensuales?: number | null
          total_ingresos_mensuales?: number | null
          total_otros_ingresos?: number | null
          total_pasivos?: number | null
          updated_at?: string | null
          valor_recurso?: number | null
        }
        Update: {
          cargo?: string | null
          celular?: string | null
          ciudad_expedicion?: string | null
          ciudad_nacimiento?: string | null
          ciudad_residencia?: string | null
          codigo_ciiu?: string | null
          codigo_postal?: string | null
          correo_electronico?: string | null
          created_at?: string | null
          departamento_nacimiento?: string | null
          departamento_residencia?: string | null
          descripcion_ciiu?: string | null
          direccion_laboral?: string | null
          direccion_residencia?: string | null
          empresa?: string | null
          estado_civil?: string | null
          familiar_pep?: boolean | null
          fecha_expedicion?: string | null
          fecha_nacimiento?: string | null
          genero?: string | null
          id?: string
          nacionalidad?: string | null
          numero_identificacion?: string | null
          obligado_tributar_otros_paises?: boolean | null
          obligado_tributar_usa?: boolean | null
          ocupacion?: string | null
          pais_nacimiento?: string | null
          pais_residencia?: string | null
          pep?: boolean | null
          primer_apellido?: string | null
          primer_nombre?: string | null
          realiza_operaciones_moneda_extranjera?: boolean | null
          recurso?: string | null
          recursos_dependen_tercero?: boolean | null
          segunda_nacionalidad?: string | null
          segundo_apellido?: string | null
          segundo_nombre?: string | null
          tipo_identificacion?: string | null
          tipo_vinculacion_laboral?: string | null
          total_activos?: number | null
          total_egresos_mensuales?: number | null
          total_ingresos_mensuales?: number | null
          total_otros_ingresos?: number | null
          total_pasivos?: number | null
          updated_at?: string | null
          valor_recurso?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
