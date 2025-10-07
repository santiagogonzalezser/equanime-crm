import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome to EQUÁNIME CRM</h1>
        <p className="text-muted-foreground">
          Your comprehensive solution for managing client relationships and business growth
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
              View your business analytics and key performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">
                View Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Client Management</CardTitle>
            </div>
            <CardDescription>
              Manage your client database and track interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/clients">
              <Button className="w-full">
                Manage Clients
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
            <CardDescription>
              Overview of your current business status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Clients</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="font-semibold">$71,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="font-semibold text-green-600">+22%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
