import { renderHook, waitFor } from '@testing-library/react';
import { useApartamentosData, useClientesData, transformToChartData } from '@/lib/database-queries';
import type { Apartamento } from '@/types/apartamentos';

// Mock environment variables
const originalEnv = process.env;

beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key'
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: [
            {
              id: '1',
              apartamento: 'Apartamento Centro',
              area_construida: 90,
              valor_mt2: 1666.67,
              area_terraza: 10,
              valor_mt2_terraza: 1000,
              valor_terraza: 10000,
              valor_ac: 150000,
              valor_total: 160000,
              cuota_inicial_pct: 30,
              cuota_inicial_valor: 48000,
              separacion_5: 8000,
              saldo_inicial: 40000,
              cuota_mensual_mes1: 2000,
              saldo_contra_escrituracion: 112000,
              vendido: false,
              created_at: '2025-01-01T00:00:00Z'
            }
          ],
          error: null
        }))
      }))
    }))
  }))
}));

describe('Database Queries', () => {
  describe('useApartamentosData', () => {
    test('fetches apartamentos data successfully', async () => {
      const { result } = renderHook(() => useApartamentosData());

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBe(null);

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0]).toHaveProperty('id', '1');
      expect(result.current.data[0]).toHaveProperty('name', 'Apartamento Centro');
      expect(result.current.error).toBe(null);
    });
  });

  describe('useClientesData', () => {
    test('fetches clientes data successfully', async () => {
      const { result } = renderHook(() => useClientesData());

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBe(null);

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.error).toBe(null);
    });
  });

  describe('transformToChartData', () => {
    test('transforms apartamentos data to chart format', () => {
      const apartamentos: Apartamento[] = [
        {
          id: '1',
          apartamento: 'Apartamento A',
          area_construida: 80,
          valor_mt2: 1250,
          area_terraza: 15,
          valor_mt2_terraza: 800,
          valor_terraza: 12000,
          valor_ac: 100000,
          valor_total: 112000,
          cuota_inicial_pct: 30,
          cuota_inicial_valor: 33600,
          separacion_5: 5600,
          saldo_inicial: 28000,
          cuota_mensual_mes1: 1200,
          saldo_contra_escrituracion: 78400,
          vendido: false,
          created_at: '2025-01-01T00:00:00Z',
          name: 'Apartamento A',
          price: 112000,
          status: 'available' as const
        },
        {
          id: '2',
          apartamento: 'Apartamento B',
          area_construida: 100,
          valor_mt2: 2000,
          area_terraza: 20,
          valor_mt2_terraza: 1000,
          valor_terraza: 20000,
          valor_ac: 200000,
          valor_total: 220000,
          cuota_inicial_pct: 30,
          cuota_inicial_valor: 66000,
          separacion_5: 11000,
          saldo_inicial: 55000,
          cuota_mensual_mes1: 2500,
          saldo_contra_escrituracion: 154000,
          vendido: true,
          created_at: '2025-01-01T00:00:00Z',
          name: 'Apartamento B',
          price: 220000,
          status: 'occupied' as const
        }
      ];

      const chartData = transformToChartData(apartamentos);

      expect(chartData).toHaveLength(2);
      expect(chartData[0]).toEqual({
        name: 'Apartamento A',
        value: 112000,
        category: 'Available'
      });
      expect(chartData[1]).toEqual({
        name: 'Apartamento B',
        value: 220000,
        category: 'Sold'
      });
    });
  });
});