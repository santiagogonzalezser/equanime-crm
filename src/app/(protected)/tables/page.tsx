import CorporateDataTable from '@/components/organisms/corporate-data-table';

export default function TablesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tablas de Datos</h1>
        <p className="text-gray-600">
          Gestiona y visualiza datos de apartamentos y clientes con filtrado avanzado y paginación
        </p>
      </div>
      <CorporateDataTable />
    </div>
  );
}