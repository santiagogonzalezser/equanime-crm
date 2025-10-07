'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ChartCard from '@/components/atoms/chart-card';
import SalesProgressBar from '@/components/molecules/sales-progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { useApartamentosData } from '@/lib/database-queries';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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

    // Average prices
    const avgPrice = apartments.reduce((sum, apt) => sum + (apt.valor_total || 0), 0) / apartments.length;
    const avgSoldPrice = soldApartments > 0 ? soldValue / soldApartments : 0;
    const avgAvailablePrice = availableApartments > 0 ? availableValue / availableApartments : 0;

    // Price range distribution
    const priceRanges = [
      { name: '< $300K', min: 0, max: 300000 },
      { name: '$300K - $500K', min: 300000, max: 500000 },
      { name: '$500K - $700K', min: 500000, max: 700000 },
      { name: '$700K - $900K', min: 700000, max: 900000 },
      { name: '> $900K', min: 900000, max: Infinity },
    ];

    const priceDistribution = priceRanges.map(range => {
      const count = apartments.filter(apt => {
        const price = apt.valor_total || 0;
        return price >= range.min && price < range.max;
      }).length;
      return { name: range.name, value: count };
    }).filter(item => item.value > 0);

    // Area vs Price analysis
    const areaAnalysis = apartments
      .filter(apt => apt.area_construida && apt.valor_total)
      .map(apt => ({
        area: apt.area_construida!,
        price: apt.valor_total!,
        pricePerSqm: Math.round((apt.valor_total! / apt.area_construida!)),
        name: apt.apartamento,
        status: apt.vendido ? 'Vendido' : 'Disponible'
      }))
      .sort((a, b) => a.area - b.area);

    // Monthly sales trend (simulated based on creation dates)
    const salesTrend = apartments
      .filter(apt => apt.vendido)
      .reduce((acc: { [key: string]: number }, apt) => {
        const date = new Date(apt.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + (apt.valor_total || 0);
        return acc;
      }, {});

    const monthlySalesData = Object.entries(salesTrend).map(([month, value]) => ({
      month: new Date(month + '-01').toLocaleDateString('es', { month: 'short', year: 'numeric' }),
      sales: value,
      count: apartments.filter(apt => apt.vendido && apt.created_at.includes(month)).length
    }));

    // Payment structure analysis
    const paymentAnalysis = apartments
      .filter(apt => apt.cuota_inicial_valor && apt.saldo_contra_escrituracion)
      .map(apt => ({
        name: apt.apartamento,
        inicial: apt.cuota_inicial_valor || 0,
        financiado: apt.saldo_contra_escrituracion || 0,
        total: apt.valor_total || 0
      }));

    return {
      totalApartments,
      soldApartments,
      availableApartments,
      soldValue,
      availableValue,
      avgPrice,
      avgSoldPrice,
      avgAvailablePrice,
      priceDistribution,
      areaAnalysis,
      monthlySalesData,
      paymentAnalysis
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* Price Distribution */}
        <ChartCard
          title="Distribución por Rangos de Precio"
          description="Cantidad de apartamentos por rango de precio"
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dashboardMetrics.priceDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {dashboardMetrics.priceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Area vs Price Analysis */}
        <ChartCard
          title="Precio por Metro Cuadrado"
          description="Análisis de precio vs área construida"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dashboardMetrics.areaAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="area"
                label={{ value: 'Área (m²)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis
                label={{ value: 'Precio por m²', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'pricePerSqm') return [`$${Number(value).toLocaleString()}/m²`, 'Precio por m²'];
                  return [value, name];
                }}
                labelFormatter={(area) => `Área: ${area}m²`}
              />
              <Area
                type="monotone"
                dataKey="pricePerSqm"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly Sales Trend */}
        {dashboardMetrics.monthlySalesData.length > 0 && (
          <ChartCard
            title="Tendencia de Ventas Mensuales"
            description="Volumen de ventas por mes"
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardMetrics.monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'sales' ? formatCurrency(Number(value)) : value,
                    name === 'sales' ? 'Ventas' : 'Unidades'
                  ]}
                />
                <Legend />
                <Bar dataKey="sales" fill="#0088FE" name="Valor Vendido" />
                <Bar dataKey="count" fill="#00C49F" name="Unidades Vendidas" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Payment Structure */}
        {dashboardMetrics.paymentAnalysis.length > 0 && (
          <ChartCard
            title="Estructura de Pagos"
            description="Distribución entre cuota inicial y financiación"
            className="lg:col-span-1"
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardMetrics.paymentAnalysis.slice(0, 5)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="inicial" stackId="a" fill="#0088FE" name="Cuota Inicial" />
                <Bar dataKey="financiado" stackId="a" fill="#00C49F" name="Financiado" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

      </div>
    </div>
  );
}