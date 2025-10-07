'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { Apartamento } from '@/types/apartamentos';
import type { Client, ChartData } from '@/types';

export function useApartamentosData() {
  const [data, setData] = useState<Apartamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: apartamentos, error } = await supabase
          .from('apartamentos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform apartamentos data to match UI interface
        const transformedApartamentos: Apartamento[] = (apartamentos || []).map(apt => ({
          ...apt,
          name: apt.apartamento || 'Unknown',
          price: Number(apt.valor_total) || 0,
          status: apt.vendido ? 'occupied' : 'available' as const
        }));

        setData(transformedApartamentos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useClientesData() {
  const [data, setData] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: clientes, error } = await supabase
          .from('clientes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Map clientes data directly - fields already match Client interface
        setData(clientes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

export function transformToChartData(apartamentos: Apartamento[]): ChartData[] {
  return apartamentos.map(apt => ({
    name: apt.apartamento,
    value: Number(apt.valor_total) || 0,
    category: apt.vendido ? 'Sold' : 'Available'
  }));
}

export function transformClientesToChartData(clientes: Client[]): ChartData[] {
  return clientes.map((client, index) => ({
    name: `${client.primer_nombre || ''} ${client.primer_apellido || ''}`.trim() || 'Unknown',
    value: index + 1, // Simple sequential numbering for now
    category: 'active'
  }));
}