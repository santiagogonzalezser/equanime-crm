'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ChartCard from '@/components/atoms/chart-card';
import DataToggle from '@/components/molecules/data-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { useApartamentosData, useClientesData, transformToChartData, transformClientesToChartData } from '@/lib/database-queries';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function SupabaseDashboard() {
  const [dataType, setDataType] = useState<'apartamentos' | 'clientes'>('apartamentos');
  const apartamentosData = useApartamentosData();
  const clientesData = useClientesData();

  const currentData = dataType === 'apartamentos' ? apartamentosData : clientesData;
  const chartData = dataType === 'apartamentos'
    ? transformToChartData(apartamentosData.data)
    : transformClientesToChartData(clientesData.data);

  // Create different chart data transformations
  const priceStatusData = chartData.reduce((acc: { name: string; value: number; count: number }[], item) => {
    const existing = acc.find(a => a.name === (item.category || 'Unknown'));
    if (existing) {
      existing.value += item.value;
      existing.count += 1;
    } else {
      acc.push({ name: item.category || 'Unknown', value: item.value, count: 1 });
    }
    return acc;
  }, []);

  const averagePriceData = priceStatusData.map(item => ({
    name: item.name,
    value: Math.round(item.value / item.count)
  }));

  const countByStatusData = priceStatusData.map(item => ({
    name: item.name,
    value: item.count
  }));

  if (currentData.loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Analytics</h1>
          <p className="text-muted-foreground">
            Overview of your CRM performance and key metrics
          </p>
        </div>

        <div className="mb-6">
          <DataToggle value={dataType} onToggle={setDataType} />
        </div>

        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          data-testid="dashboard-grid"
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64">
              <Skeleton className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentData.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Analytics</h1>
          <p className="text-muted-foreground">
            Overview of your CRM performance and key metrics
          </p>
        </div>

        <div className="mb-6">
          <DataToggle value={dataType} onToggle={setDataType} />
        </div>

        <div className="p-6 text-center">
          <p className="text-red-600">Error loading data: {currentData.error}</p>
          <p className="text-muted-foreground mt-2">
            Please check your database connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Analytics</h1>
        <p className="text-muted-foreground">
          Overview of your CRM performance and key metrics
        </p>
      </div>

      <div className="mb-6">
        <DataToggle value={dataType} onToggle={setDataType} />
      </div>

      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        data-testid="dashboard-grid"
      >
        <ChartCard
          title={`Total ${dataType === 'apartamentos' ? 'Properties' : 'Clients'} Value`}
          description={`Value breakdown by ${dataType === 'apartamentos' ? 'property price' : 'client value'}`}
          className="md:col-span-2"
        >
          <ResponsiveContainer width="100%" height={200} data-testid="chart-container-value">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']} />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={`Average ${dataType === 'apartamentos' ? 'Price' : 'Value'} by Status`}
          description={`Average values grouped by status`}
        >
          <ResponsiveContainer width="100%" height={200} data-testid="chart-container-average">
            <LineChart data={averagePriceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Avg Value']} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Status Distribution"
          description={`Distribution of ${dataType} by status`}
        >
          <ResponsiveContainer width="100%" height={200} data-testid="chart-container-status">
            <PieChart>
              <Pie
                data={countByStatusData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {countByStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Value Distribution"
          description={`Total value distribution by status`}
          className="md:col-span-2 lg:col-span-1"
        >
          <ResponsiveContainer width="100%" height={200} data-testid="chart-container-distribution">
            <AreaChart data={priceStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Total Value']} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-3))"
                fill="hsl(var(--chart-3))"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}