export interface Apartamento {
  id: string;
  apartamento: string;
  area_construida: number | null;
  valor_mt2: number | null;
  area_terraza: number | null;
  valor_mt2_terraza: number | null;
  valor_terraza: number | null;
  valor_ac: number | null;
  valor_total: number | null;
  cuota_inicial_pct: number | null;
  cuota_inicial_valor: number | null;
  separacion_5: number | null;
  saldo_inicial: number | null;
  cuota_mensual_mes1: number | null;
  saldo_contra_escrituracion: number | null;
  vendido: boolean | null;
  created_at: string;
  // Computed properties for UI compatibility
  name: string;
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
}

export interface DatabaseChartData {
  id?: string;
  name: string;
  value: number;
  date?: string;
  category?: string;
  created_at?: string;
}