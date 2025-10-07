'use client';

import { useMemo } from 'react';
import SalesProgressBar from '@/components/molecules/sales-progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { useApartamentosData } from '@/lib/database-queries';

export default function EnhancedDashboard() {
  const apartamentosData = useApartamentosData();

  const dashboardMetrics = useMemo(() => {
    if (!apartamentosData.data.length) return null;

    const apartments = apartamentosData.data;

    // Sales metrics
    const totalApartments = apartments.length;
    const soldApartments = apartments.filter(apt => apt.vendido).length;
    const availableApartments = totalApartments - soldApartments;

    // Financial metrics
    const soldValue = apartments
      .filter(apt => apt.vendido)
      .reduce((sum, apt) => sum + (apt.valor_total || 0), 0);
    const availableValue = apartments
      .filter(apt => !apt.vendido)
      .reduce((sum, apt) => sum + (apt.valor_total || 0), 0);

    return {
      totalApartments,
      soldApartments,
      availableApartments,
      soldValue,
      availableValue,
    };
  }, [apartamentosData.data]);

  if (apartamentosData.loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Inmobiliario</h1>
          <p className="text-muted-foreground">
            Análisis completo de ventas y disponibilidad de apartamentos
          </p>
        </div>

        <Skeleton className="h-32 w-full" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (apartamentosData.error || !dashboardMetrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Inmobiliario</h1>
          <p className="text-muted-foreground">
            Análisis completo de ventas y disponibilidad de apartamentos
          </p>
        </div>

        <div className="p-6 text-center">
          <p className="text-red-600">Error cargando datos: {apartamentosData.error}</p>
          <p className="text-muted-foreground mt-2">
            Por favor verifica tu conexión a la base de datos e intenta nuevamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Inmobiliario</h1>
        <p className="text-muted-foreground">
          Análisis completo de ventas y disponibilidad de apartamentos
        </p>
      </div>

      {/* Progress Bar */}
      <SalesProgressBar
        totalApartments={dashboardMetrics.totalApartments}
        soldApartments={dashboardMetrics.soldApartments}
        availableApartments={dashboardMetrics.availableApartments}
        soldValue={dashboardMetrics.soldValue}
        availableValue={dashboardMetrics.availableValue}
      />
    </div>
  );
}