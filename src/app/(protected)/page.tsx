import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, Users, UserPlus, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bienvenido</h1>
        <p className="text-muted-foreground">
          Herramienta para gestionar los procesos operativos de la sala de ventas de ARIA 93
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Dashboard</CardTitle>
            </div>
            <CardDescription>
              Visualiza las analíticas del proyecto y métricas clave de rendimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">
                Ver Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Tablas</CardTitle>
            </div>
            <CardDescription>
              Administra tablas de apartamentos, clientes y leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/tables">
              <Button className="w-full">
                Ver Tablas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Agregar Cliente</CardTitle>
            </div>
            <CardDescription>
              Registra nuevos compradores en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/clientes/nuevo">
              <Button className="w-full">
                Nuevo Cliente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
