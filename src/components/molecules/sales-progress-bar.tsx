'use client';

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Home, DollarSign } from 'lucide-react';

interface SalesProgressBarProps {
  totalApartments: number;
  soldApartments: number;
  availableApartments: number;
  soldValue: number;
  availableValue: number;
}

export default function SalesProgressBar({
  totalApartments,
  soldApartments,
  availableApartments,
  soldValue,
  availableValue
}: SalesProgressBarProps) {
  const progressPercentage = useMemo(() => {
    return totalApartments > 0 ? (soldApartments / totalApartments) * 100 : 0;
  }, [soldApartments, totalApartments]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="w-full bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Progreso de Ventas
                </h3>
                <p className="text-sm text-gray-600">
                  Estado actual del inventario de apartamentos
                </p>
              </div>
            </div>
            <Badge
              variant={progressPercentage >= 75 ? "default" : progressPercentage >= 50 ? "secondary" : "outline"}
              className="text-base font-medium px-3 py-1"
            >
              {progressPercentage.toFixed(1)}% Vendido
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">
                {soldApartments} de {totalApartments} apartamentos vendidos
              </span>
              <span className="text-gray-600">
                {availableApartments} disponibles
              </span>
            </div>

            <Progress
              value={progressPercentage}
              className="h-3 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-green-500 [&>div]:transition-all [&>div]:duration-300"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm">
                <Home className="h-4 w-4 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Total Unidades
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {totalApartments}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Valor Vendido
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(soldValue)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm">
                <DollarSign className="h-4 w-4 text-orange-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Valor Disponible
                  </p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(availableValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}