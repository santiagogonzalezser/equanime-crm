'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings2, Pin, PinOff, Edit3, Save, X, FileText } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import DataSelector from '@/components/molecules/data-selector';
import { useApartamentosData, useClientesData } from '@/lib/database-queries';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { createClient } from '@/lib/supabase';
import { ClientDocumentModal } from '@/components/organisms/client-document-modal';
import type { Apartamento } from '@/types/apartamentos';
import type { Client } from '@/types';

const ITEMS_PER_PAGE = 20;

type SortKey = 'apartamento' | 'area_construida' | 'valor_mt2' | 'area_terraza' | 'valor_mt2_terraza' | 'valor_terraza' | 'valor_ac' | 'valor_total' | 'cuota_inicial_pct' | 'cuota_inicial_valor' | 'separacion_5' | 'saldo_inicial' | 'cuota_mensual_mes1' | 'saldo_contra_escrituracion' | 'vendido' | 'numero_identificacion' | 'tipo_identificacion' | 'fecha_expedicion' | 'ciudad_expedicion' | 'primer_nombre' | 'segundo_nombre' | 'primer_apellido' | 'segundo_apellido' | 'fecha_nacimiento' | 'pais_nacimiento' | 'departamento_nacimiento' | 'ciudad_nacimiento' | 'genero' | 'estado_civil' | 'nacionalidad' | 'segunda_nacionalidad' | 'correo_electronico' | 'celular' | 'direccion_residencia' | 'pais_residencia' | 'departamento_residencia' | 'ciudad_residencia' | 'codigo_postal' | 'ocupacion' | 'pep' | 'familiar_pep' | 'descripcion_ciiu' | 'codigo_ciiu' | 'obligado_tributar_usa' | 'obligado_tributar_otros_paises' | 'tipo_vinculacion_laboral' | 'empresa' | 'cargo' | 'direccion_laboral' | 'total_activos' | 'total_pasivos' | 'total_ingresos_mensuales' | 'total_egresos_mensuales' | 'total_otros_ingresos' | 'realiza_operaciones_moneda_extranjera' | 'recursos_dependen_tercero' | 'recurso' | 'valor_recurso';
type SortOrder = 'asc' | 'desc';

export default function CorporateDataTable() {
  const [dataType, setDataType] = useState<'apartamentos' | 'clientes'>('apartamentos');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('apartamento');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [savingChanges, setSavingChanges] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    // Apartamentos columns
    apartamento: true,
    area_construida: true,
    valor_mt2: true,
    area_terraza: true,
    valor_mt2_terraza: true,
    valor_terraza: true,
    valor_ac: true,
    valor_total: true,
    cuota_inicial_pct: true,
    cuota_inicial_valor: true,
    separacion_5: true,
    saldo_inicial: true,
    cuota_mensual_mes1: true,
    saldo_contra_escrituracion: true,
    vendido: true,
    // Clientes columns - ALL 46 columns from Supabase
    numero_identificacion: true,
    tipo_identificacion: true,
    fecha_expedicion: true,
    ciudad_expedicion: true,
    primer_nombre: true,
    segundo_nombre: true,
    primer_apellido: true,
    segundo_apellido: true,
    fecha_nacimiento: true,
    pais_nacimiento: true,
    departamento_nacimiento: true,
    ciudad_nacimiento: true,
    genero: true,
    estado_civil: true,
    nacionalidad: true,
    segunda_nacionalidad: true,
    correo_electronico: true,
    celular: true,
    direccion_residencia: true,
    pais_residencia: true,
    departamento_residencia: true,
    ciudad_residencia: true,
    codigo_postal: true,
    ocupacion: true,
    pep: true,
    familiar_pep: true,
    descripcion_ciiu: true,
    codigo_ciiu: true,
    obligado_tributar_usa: true,
    obligado_tributar_otros_paises: true,
    tipo_vinculacion_laboral: true,
    empresa: true,
    cargo: true,
    direccion_laboral: true,
    total_activos: true,
    total_pasivos: true,
    total_ingresos_mensuales: true,
    total_egresos_mensuales: true,
    total_otros_ingresos: true,
    realiza_operaciones_moneda_extranjera: true,
    recursos_dependen_tercero: true,
    recurso: true,
    valor_recurso: true,
  });

  const apartamentosData = useApartamentosData();
  const clientesData = useClientesData();

  const currentData = dataType === 'apartamentos' ? apartamentosData : clientesData;

  const filteredAndSortedData = useMemo(() => {
    if (!currentData.data.length) return [];

    const filtered = currentData.data.filter((item: Apartamento | Client) => {
      if (!searchTerm) return true;

      const searchString = searchTerm.toLowerCase();

      if (dataType === 'apartamentos') {
        const apt = item as Apartamento;

        if (searchColumn === 'all') {
          return (
            String(apt.apartamento || '').toLowerCase().includes(searchString) ||
            String(apt.area_construida || '').toLowerCase().includes(searchString) ||
            String(apt.valor_mt2 || '').toLowerCase().includes(searchString) ||
            String(apt.area_terraza || '').toLowerCase().includes(searchString) ||
            String(apt.valor_total || '').toLowerCase().includes(searchString) ||
            (apt.vendido ? 'sold' : 'available').includes(searchString)
          );
        } else {
          const fieldValue = String((apt as unknown as Record<string, unknown>)[searchColumn] || '').toLowerCase();
          return fieldValue.includes(searchString);
        }
      } else {
        const client = item as Client;

        if (searchColumn === 'all') {
          return (
            String(client.numero_identificacion || '').toLowerCase().includes(searchString) ||
            String(client.primer_nombre || '').toLowerCase().includes(searchString) ||
            String(client.segundo_nombre || '').toLowerCase().includes(searchString) ||
            String(client.primer_apellido || '').toLowerCase().includes(searchString) ||
            String(client.segundo_apellido || '').toLowerCase().includes(searchString) ||
            String(client.celular || '').toLowerCase().includes(searchString) ||
            String(client.correo_electronico || '').toLowerCase().includes(searchString) ||
            String(client.direccion_residencia || '').toLowerCase().includes(searchString) ||
            String(client.empresa || '').toLowerCase().includes(searchString) ||
            String(client.ocupacion || '').toLowerCase().includes(searchString)
          );
        } else {
          const fieldValue = String((client as unknown as Record<string, unknown>)[searchColumn] || '').toLowerCase();
          return fieldValue.includes(searchString);
        }
      }
    });

    filtered.sort((a: Apartamento | Client, b: Apartamento | Client) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortKey) {
        // Apartamentos fields
        case 'apartamento':
          aValue = 'apartamento' in a ? (a as Apartamento).apartamento || '' : '';
          bValue = 'apartamento' in b ? (b as Apartamento).apartamento || '' : '';
          break;
        case 'area_construida':
          aValue = Number('area_construida' in a ? (a as Apartamento).area_construida || 0 : 0);
          bValue = Number('area_construida' in b ? (b as Apartamento).area_construida || 0 : 0);
          break;
        case 'valor_mt2':
          aValue = Number('valor_mt2' in a ? (a as Apartamento).valor_mt2 || 0 : 0);
          bValue = Number('valor_mt2' in b ? (b as Apartamento).valor_mt2 || 0 : 0);
          break;
        case 'area_terraza':
          aValue = Number('area_terraza' in a ? (a as Apartamento).area_terraza || 0 : 0);
          bValue = Number('area_terraza' in b ? (b as Apartamento).area_terraza || 0 : 0);
          break;
        case 'valor_mt2_terraza':
          aValue = Number('valor_mt2_terraza' in a ? (a as Apartamento).valor_mt2_terraza || 0 : 0);
          bValue = Number('valor_mt2_terraza' in b ? (b as Apartamento).valor_mt2_terraza || 0 : 0);
          break;
        case 'valor_terraza':
          aValue = Number('valor_terraza' in a ? (a as Apartamento).valor_terraza || 0 : 0);
          bValue = Number('valor_terraza' in b ? (b as Apartamento).valor_terraza || 0 : 0);
          break;
        case 'valor_ac':
          aValue = Number('valor_ac' in a ? (a as Apartamento).valor_ac || 0 : 0);
          bValue = Number('valor_ac' in b ? (b as Apartamento).valor_ac || 0 : 0);
          break;
        case 'valor_total':
          aValue = Number('valor_total' in a ? (a as Apartamento).valor_total || 0 : 0);
          bValue = Number('valor_total' in b ? (b as Apartamento).valor_total || 0 : 0);
          break;
        case 'cuota_inicial_pct':
          aValue = Number('cuota_inicial_pct' in a ? (a as Apartamento).cuota_inicial_pct || 0 : 0);
          bValue = Number('cuota_inicial_pct' in b ? (b as Apartamento).cuota_inicial_pct || 0 : 0);
          break;
        case 'cuota_inicial_valor':
          aValue = Number('cuota_inicial_valor' in a ? (a as Apartamento).cuota_inicial_valor || 0 : 0);
          bValue = Number('cuota_inicial_valor' in b ? (b as Apartamento).cuota_inicial_valor || 0 : 0);
          break;
        case 'separacion_5':
          aValue = Number('separacion_5' in a ? (a as Apartamento).separacion_5 || 0 : 0);
          bValue = Number('separacion_5' in b ? (b as Apartamento).separacion_5 || 0 : 0);
          break;
        case 'saldo_inicial':
          aValue = Number('saldo_inicial' in a ? (a as Apartamento).saldo_inicial || 0 : 0);
          bValue = Number('saldo_inicial' in b ? (b as Apartamento).saldo_inicial || 0 : 0);
          break;
        case 'cuota_mensual_mes1':
          aValue = Number('cuota_mensual_mes1' in a ? (a as Apartamento).cuota_mensual_mes1 || 0 : 0);
          bValue = Number('cuota_mensual_mes1' in b ? (b as Apartamento).cuota_mensual_mes1 || 0 : 0);
          break;
        case 'saldo_contra_escrituracion':
          aValue = Number('saldo_contra_escrituracion' in a ? (a as Apartamento).saldo_contra_escrituracion || 0 : 0);
          bValue = Number('saldo_contra_escrituracion' in b ? (b as Apartamento).saldo_contra_escrituracion || 0 : 0);
          break;
        case 'vendido':
          aValue = 'vendido' in a ? (a as Apartamento).vendido ? 1 : 0 : 0;
          bValue = 'vendido' in b ? (b as Apartamento).vendido ? 1 : 0 : 0;
          break;
        // Clientes fields
        case 'numero_identificacion':
          aValue = 'numero_identificacion' in a ? (a as Client).numero_identificacion || '' : '';
          bValue = 'numero_identificacion' in b ? (b as Client).numero_identificacion || '' : '';
          break;
        case 'primer_nombre':
          aValue = 'primer_nombre' in a ? (a as Client).primer_nombre || '' : '';
          bValue = 'primer_nombre' in b ? (b as Client).primer_nombre || '' : '';
          break;
        case 'primer_apellido':
          aValue = 'primer_apellido' in a ? (a as Client).primer_apellido || '' : '';
          bValue = 'primer_apellido' in b ? (b as Client).primer_apellido || '' : '';
          break;
        case 'celular':
          aValue = 'celular' in a ? (a as Client).celular || '' : '';
          bValue = 'celular' in b ? (b as Client).celular || '' : '';
          break;
        case 'correo_electronico':
          aValue = 'correo_electronico' in a ? (a as Client).correo_electronico || '' : '';
          bValue = 'correo_electronico' in b ? (b as Client).correo_electronico || '' : '';
          break;
        case 'direccion_residencia':
          aValue = 'direccion_residencia' in a ? (a as Client).direccion_residencia || '' : '';
          bValue = 'direccion_residencia' in b ? (b as Client).direccion_residencia || '' : '';
          break;
        case 'ciudad_residencia':
          aValue = 'ciudad_residencia' in a ? (a as Client).ciudad_residencia || '' : '';
          bValue = 'ciudad_residencia' in b ? (b as Client).ciudad_residencia || '' : '';
          break;
        case 'ocupacion':
          aValue = 'ocupacion' in a ? (a as Client).ocupacion || '' : '';
          bValue = 'ocupacion' in b ? (b as Client).ocupacion || '' : '';
          break;
        case 'empresa':
          aValue = 'empresa' in a ? (a as Client).empresa || '' : '';
          bValue = 'empresa' in b ? (b as Client).empresa || '' : '';
          break;
        case 'tipo_identificacion':
        case 'ciudad_expedicion':
        case 'segundo_nombre':
        case 'segundo_apellido':
        case 'pais_nacimiento':
        case 'departamento_nacimiento':
        case 'ciudad_nacimiento':
        case 'genero':
        case 'estado_civil':
        case 'nacionalidad':
        case 'segunda_nacionalidad':
        case 'pais_residencia':
        case 'departamento_residencia':
        case 'codigo_postal':
        case 'descripcion_ciiu':
        case 'codigo_ciiu':
        case 'tipo_vinculacion_laboral':
        case 'cargo':
        case 'direccion_laboral':
        case 'recurso':
          aValue = sortKey in a ? String((a as Client)[sortKey as keyof Client] || '') : '';
          bValue = sortKey in b ? String((b as Client)[sortKey as keyof Client] || '') : '';
          break;
        case 'fecha_expedicion':
        case 'fecha_nacimiento':
          aValue = sortKey in a ? new Date((a as Client)[sortKey as keyof Client] as string || 0).getTime() : 0;
          bValue = sortKey in b ? new Date((b as Client)[sortKey as keyof Client] as string || 0).getTime() : 0;
          break;
        case 'pep':
        case 'familiar_pep':
        case 'obligado_tributar_usa':
        case 'obligado_tributar_otros_paises':
        case 'realiza_operaciones_moneda_extranjera':
        case 'recursos_dependen_tercero':
          aValue = sortKey in a ? ((a as Client)[sortKey as keyof Client] ? 1 : 0) : 0;
          bValue = sortKey in b ? ((b as Client)[sortKey as keyof Client] ? 1 : 0) : 0;
          break;
        case 'total_activos':
        case 'total_pasivos':
        case 'total_ingresos_mensuales':
        case 'total_egresos_mensuales':
        case 'total_otros_ingresos':
        case 'valor_recurso':
          aValue = sortKey in a ? Number((a as Client)[sortKey as keyof Client] || 0) : 0;
          bValue = sortKey in b ? Number((b as Client)[sortKey as keyof Client] || 0) : 0;
          break;
        default:
          aValue = '';
          bValue = '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [currentData.data, searchTerm, sortKey, sortOrder, dataType, searchColumn]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);

  // Reset to first page when search term, data type, or search column changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, dataType, searchColumn]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleDataTypeChange = (newDataType: 'apartamentos' | 'clientes') => {
    setDataType(newDataType);
    setSortKey(newDataType === 'apartamentos' ? 'apartamento' : 'numero_identificacion');
    // Reset pinned columns when switching data type
    setPinnedColumns([]);
  };

  const handlePinColumn = (columnKey: string) => {
    if (pinnedColumns.includes(columnKey)) {
      // Unpin column
      setPinnedColumns(prev => prev.filter(col => col !== columnKey));
    } else if (pinnedColumns.length < 3) {
      // Pin column (max 3)
      setPinnedColumns(prev => [...prev, columnKey]);
    }
  };

  const canPinColumn = (columnKey: string) => {
    // Can't pin the first column (apartamento/numero_identificacion) and max 3 pins
    const firstColumn = dataType === 'apartamentos' ? 'apartamento' : 'numero_identificacion';
    return columnKey !== firstColumn && (pinnedColumns.includes(columnKey) || pinnedColumns.length < 3);
  };

  // Calculate sticky positions for pinned columns
  const getStickyPosition = (columnKey: string) => {
    const firstColumn = dataType === 'apartamentos' ? 'apartamento' : 'numero_identificacion';
    const firstColumnWidth = dataType === 'apartamentos' ? 160 : 160; // w-40 = 160px

    if (columnKey === firstColumn) {
      return 0;
    }

    const pinnedIndex = pinnedColumns.indexOf(columnKey);
    if (pinnedIndex === -1) {
      return null; // Not pinned
    }

    // Each pinned column is 128px wide
    return firstColumnWidth + (pinnedIndex * 128);
  };

  // Handle cell editing
  const handleCellEdit = (rowId: string, column: string, currentValue: string | number | boolean | null) => {
    if (!isEditMode) return;
    setEditingCell({ rowId, column });
    setEditValue(String(currentValue || ''));
  };

  const handleSaveEdit = async () => {
    if (!editingCell || savingChanges) return;

    setSavingChanges(true);
    try {
      const tableName = dataType === 'apartamentos' ? 'apartamentos' : 'clientes';
      const supabase = createClient();
      const { error } = await supabase
        .from(tableName)
        .update({ [editingCell.column]: editValue })
        .eq('id', editingCell.rowId);

      if (error) {
        console.error('Error updating data:', error);
        alert('Error al guardar los cambios');
      } else {
        // Data will be refreshed on next page load
        alert('Cambios guardados correctamente');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error al guardar los cambios');
    } finally {
      setSavingChanges(false);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleViewDocument = (client: Client) => {
    setSelectedClient(client);
    setIsDocumentModalOpen(true);
  };

  if (currentData.loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <DataSelector value={dataType} onToggle={handleDataTypeChange} />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" data-testid="skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (currentData.error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <DataSelector value={dataType} onToggle={handleDataTypeChange} />
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-900">Error loading data: {currentData.error}</p>
          <p className="text-gray-500 mt-2">
            Please check your database connection and try again.
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

  // Get visible columns in correct order (first column, then pinned, then others)
  const getOrderedColumns = () => {
    const allColumns = getVisibleColumnsForDataType();
    const firstColumn = allColumns[0]; // apartamento or documento
    const otherColumns = allColumns.slice(1);

    const pinnedCols = pinnedColumns
      .map(key => allColumns.find(col => col.key === key))
      .filter(Boolean) as typeof allColumns;

    const unpinnedCols = otherColumns.filter(col =>
      !pinnedColumns.includes(col.key) && visibleColumns[col.key]
    );

    return [firstColumn, ...pinnedCols, ...unpinnedCols].filter(col => visibleColumns[col.key]);
  };

  // Get searchable columns for current data type
  const getSearchableColumns = () => {
    if (dataType === 'apartamentos') {
      return [
        { value: 'all', label: 'Todas las columnas' },
        { value: 'apartamento', label: 'Apartamento' },
        { value: 'area_construida', label: 'Área Construida' },
        { value: 'valor_mt2', label: 'Valor m²' },
        { value: 'area_terraza', label: 'Área Terraza' },
        { value: 'valor_mt2_terraza', label: 'Valor m² Terraza' },
        { value: 'valor_terraza', label: 'Valor Terraza' },
        { value: 'valor_ac', label: 'Valor A.C.' },
        { value: 'valor_total', label: 'Valor Total' },
        { value: 'cuota_inicial_pct', label: 'Cuota Inicial %' },
        { value: 'cuota_inicial_valor', label: 'Cuota Inicial Valor' },
        { value: 'separacion_5', label: 'Separación 5%' },
        { value: 'saldo_inicial', label: 'Saldo Inicial' },
        { value: 'cuota_mensual_mes1', label: 'Cuota Mensual Mes 1' },
        { value: 'saldo_contra_escrituracion', label: 'Saldo Contra Escrituración' },
        { value: 'vendido', label: 'Vendido' },
      ];
    } else {
      return [
        { value: 'all', label: 'Todas las columnas' },
        // Identification (4)
        { value: 'numero_identificacion', label: 'Número Identificación' },
        { value: 'tipo_identificacion', label: 'Tipo Identificación' },
        { value: 'fecha_expedicion', label: 'Fecha Expedición' },
        { value: 'ciudad_expedicion', label: 'Ciudad Expedición' },
        // Personal Information (12)
        { value: 'primer_nombre', label: 'Primer Nombre' },
        { value: 'segundo_nombre', label: 'Segundo Nombre' },
        { value: 'primer_apellido', label: 'Primer Apellido' },
        { value: 'segundo_apellido', label: 'Segundo Apellido' },
        { value: 'fecha_nacimiento', label: 'Fecha Nacimiento' },
        { value: 'pais_nacimiento', label: 'País Nacimiento' },
        { value: 'departamento_nacimiento', label: 'Departamento Nacimiento' },
        { value: 'ciudad_nacimiento', label: 'Ciudad Nacimiento' },
        { value: 'genero', label: 'Género' },
        { value: 'estado_civil', label: 'Estado Civil' },
        { value: 'nacionalidad', label: 'Nacionalidad' },
        { value: 'segunda_nacionalidad', label: 'Segunda Nacionalidad' },
        // Contact Information (7)
        { value: 'correo_electronico', label: 'Correo Electrónico' },
        { value: 'celular', label: 'Celular' },
        { value: 'direccion_residencia', label: 'Dirección Residencia' },
        { value: 'pais_residencia', label: 'País Residencia' },
        { value: 'departamento_residencia', label: 'Departamento Residencia' },
        { value: 'ciudad_residencia', label: 'Ciudad Residencia' },
        { value: 'codigo_postal', label: 'Código Postal' },
        // Employment Information (7)
        { value: 'ocupacion', label: 'Ocupación' },
        { value: 'tipo_vinculacion_laboral', label: 'Tipo Vinculación Laboral' },
        { value: 'empresa', label: 'Empresa' },
        { value: 'cargo', label: 'Cargo' },
        { value: 'direccion_laboral', label: 'Dirección Laboral' },
        { value: 'descripcion_ciiu', label: 'Descripción CIIU' },
        { value: 'codigo_ciiu', label: 'Código CIIU' },
        // Financial Information (5)
        { value: 'total_activos', label: 'Total Activos' },
        { value: 'total_pasivos', label: 'Total Pasivos' },
        { value: 'total_ingresos_mensuales', label: 'Total Ingresos Mensuales' },
        { value: 'total_egresos_mensuales', label: 'Total Egresos Mensuales' },
        { value: 'total_otros_ingresos', label: 'Total Otros Ingresos' },
        // Compliance Information (8)
        { value: 'pep', label: 'PEP' },
        { value: 'familiar_pep', label: 'Familiar PEP' },
        { value: 'obligado_tributar_usa', label: 'Obligado Tributar USA' },
        { value: 'obligado_tributar_otros_paises', label: 'Obligado Tributar Otros Países' },
        { value: 'realiza_operaciones_moneda_extranjera', label: 'Opera Moneda Extranjera' },
        { value: 'recursos_dependen_tercero', label: 'Recursos de Tercero' },
        { value: 'recurso', label: 'Recurso' },
        { value: 'valor_recurso', label: 'Valor Recurso' },
      ];
    }
  };

  const getVisibleColumnsForDataType = () => {
    if (dataType === 'apartamentos') {
      return [
        { key: 'apartamento', label: 'Apartamento' },
        { key: 'area_construida', label: 'Área Construida' },
        { key: 'valor_mt2', label: 'Valor m²' },
        { key: 'area_terraza', label: 'Área Terraza' },
        { key: 'valor_mt2_terraza', label: 'Valor m² Terraza' },
        { key: 'valor_terraza', label: 'Valor Terraza' },
        { key: 'valor_ac', label: 'Valor A.C.' },
        { key: 'valor_total', label: 'Valor Total' },
        { key: 'cuota_inicial_pct', label: 'Cuota Inicial %' },
        { key: 'cuota_inicial_valor', label: 'Cuota Inicial Valor' },
        { key: 'separacion_5', label: 'Separación 5%' },
        { key: 'saldo_inicial', label: 'Saldo Inicial' },
        { key: 'cuota_mensual_mes1', label: 'Cuota Mensual Mes 1' },
        { key: 'saldo_contra_escrituracion', label: 'Saldo Contra Escrituración' },
        { key: 'vendido', label: 'Vendido' },
      ];
    } else {
      return [
        // Identification (4)
        { key: 'numero_identificacion', label: 'Número Identificación' },
        { key: 'tipo_identificacion', label: 'Tipo Identificación' },
        { key: 'fecha_expedicion', label: 'Fecha Expedición' },
        { key: 'ciudad_expedicion', label: 'Ciudad Expedición' },
        // Personal Information (12)
        { key: 'primer_nombre', label: 'Primer Nombre' },
        { key: 'segundo_nombre', label: 'Segundo Nombre' },
        { key: 'primer_apellido', label: 'Primer Apellido' },
        { key: 'segundo_apellido', label: 'Segundo Apellido' },
        { key: 'fecha_nacimiento', label: 'Fecha Nacimiento' },
        { key: 'pais_nacimiento', label: 'País Nacimiento' },
        { key: 'departamento_nacimiento', label: 'Depto. Nacimiento' },
        { key: 'ciudad_nacimiento', label: 'Ciudad Nacimiento' },
        { key: 'genero', label: 'Género' },
        { key: 'estado_civil', label: 'Estado Civil' },
        { key: 'nacionalidad', label: 'Nacionalidad' },
        { key: 'segunda_nacionalidad', label: 'Segunda Nacionalidad' },
        // Contact Information (7)
        { key: 'correo_electronico', label: 'Correo Electrónico' },
        { key: 'celular', label: 'Celular' },
        { key: 'direccion_residencia', label: 'Dirección Residencia' },
        { key: 'pais_residencia', label: 'País Residencia' },
        { key: 'departamento_residencia', label: 'Depto. Residencia' },
        { key: 'ciudad_residencia', label: 'Ciudad Residencia' },
        { key: 'codigo_postal', label: 'Código Postal' },
        // Employment (7)
        { key: 'ocupacion', label: 'Ocupación' },
        { key: 'tipo_vinculacion_laboral', label: 'Tipo Vinculación' },
        { key: 'empresa', label: 'Empresa' },
        { key: 'cargo', label: 'Cargo' },
        { key: 'direccion_laboral', label: 'Dirección Laboral' },
        { key: 'descripcion_ciiu', label: 'Descripción CIIU' },
        { key: 'codigo_ciiu', label: 'Código CIIU' },
        // Financial (5)
        { key: 'total_activos', label: 'Total Activos' },
        { key: 'total_pasivos', label: 'Total Pasivos' },
        { key: 'total_ingresos_mensuales', label: 'Ingresos Mensuales' },
        { key: 'total_egresos_mensuales', label: 'Egresos Mensuales' },
        { key: 'total_otros_ingresos', label: 'Otros Ingresos' },
        // Compliance (8)
        { key: 'pep', label: 'PEP' },
        { key: 'familiar_pep', label: 'Familiar PEP' },
        { key: 'obligado_tributar_usa', label: 'Tributa USA' },
        { key: 'obligado_tributar_otros_paises', label: 'Tributa Otros Países' },
        { key: 'realiza_operaciones_moneda_extranjera', label: 'Opera Moneda Extranjera' },
        { key: 'recursos_dependen_tercero', label: 'Recursos de Tercero' },
        { key: 'recurso', label: 'Recurso' },
        { key: 'valor_recurso', label: 'Valor Recurso' },
      ];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <DataSelector value={dataType} onToggle={handleDataTypeChange} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Columnas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[280px]">
              <DropdownMenuLabel>Gestionar Columnas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {getVisibleColumnsForDataType().map((column) => (
                <div key={column.key} className="flex items-center justify-between px-2 py-1">
                  <DropdownMenuCheckboxItem
                    className="flex-1"
                    checked={visibleColumns[column.key]}
                    onCheckedChange={(value) =>
                      setVisibleColumns(prev => ({ ...prev, [column.key]: value }))
                    }
                    disabled={column.key === 'apartamento' || column.key === 'numero_identificacion'} // First column always visible
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                  {canPinColumn(column.key) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-2"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePinColumn(column.key);
                      }}
                    >
                      {pinnedColumns.includes(column.key) ? (
                        <PinOff className="h-3 w-3" />
                      ) : (
                        <Pin className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
              {pinnedColumns.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1 text-xs text-gray-500">
                    Columnas fijadas: {pinnedColumns.length}/3
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-sm text-gray-600">
            Mostrando {paginatedData.length} de {filteredAndSortedData.length} registros
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Select value={searchColumn} onValueChange={setSearchColumn}>
              <SelectTrigger className="w-48 bg-white border-gray-300">
                <SelectValue placeholder="Buscar en..." />
              </SelectTrigger>
              <SelectContent>
                {getSearchableColumns().map((column) => (
                  <SelectItem key={column.value} value={column.value}>
                    {column.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder={`Buscar...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-white border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            />
          </div>

          <Button
            variant={isEditMode ? "destructive" : "outline"}
            onClick={() => setIsEditMode(!isEditMode)}
            className="ml-auto"
          >
            {isEditMode ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </>
            ) : (
              <>
                <Edit3 className="mr-2 h-4 w-4" />
                Editar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <ScrollArea className="w-full whitespace-nowrap rounded-lg">
          <Table className="min-w-max">
          <TableHeader>
            <TableRow>
              {/* Actions column for clientes only */}
              {dataType === 'clientes' && (
                <TableHead className="sticky z-20 bg-gray-50 border-r border-gray-200 w-32" style={{ left: 0 }}>
                  Acciones
                </TableHead>
              )}
              {getOrderedColumns().map((column) => {
                const isPinned = pinnedColumns.includes(column.key);
                const isFirstColumn = column.key === (dataType === 'apartamentos' ? 'apartamento' : 'numero_identificacion');
                const stickyLeft = getStickyPosition(column.key);

                // Adjust sticky position for clientes to account for actions column
                const adjustedStickyLeft = dataType === 'clientes' && (isFirstColumn || isPinned)
                  ? (stickyLeft !== null ? stickyLeft + 128 : 128)
                  : stickyLeft;

                const headerClasses = [
                  'w-32',
                  dataType === 'apartamentos' && ['area_construida', 'valor_mt2', 'area_terraza', 'valor_mt2_terraza', 'valor_terraza', 'valor_ac', 'valor_total', 'cuota_inicial_pct', 'cuota_inicial_valor', 'separacion_5', 'saldo_inicial', 'cuota_mensual_mes1', 'saldo_contra_escrituracion'].includes(column.key) ? 'text-right' : '',
                  dataType === 'clientes' && column.key === 'vendido' ? 'text-center w-24' : '',
                  dataType === 'clientes' && ['nombre', 'razon_social', 'correo'].includes(column.key) ? 'w-48' : '',
                  dataType === 'clientes' && column.key === 'direccion' ? 'w-64' : '',
                  (isFirstColumn || isPinned) ? 'sticky z-20' : '',
                  (isFirstColumn || isPinned) ? 'bg-gray-50 border-r border-gray-200' : '',
                  isPinned ? 'bg-blue-50 border-blue-200' : ''
                ].filter(Boolean).join(' ');

                const style = (isFirstColumn || isPinned) ? { left: `${adjustedStickyLeft}px` } : {};

                return (
                  <TableHead key={column.key} className={headerClasses} style={style}>
                    <Button variant="ghost" onClick={() => handleSort(column.key as SortKey)}>
                      {column.label} {sortKey === column.key && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Button>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={getOrderedColumns().length}
                  className="text-center py-8"
                >
                  No {dataType} found{searchTerm && ` for "${searchTerm}"`}.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item: Apartamento | Client) => (
                <TableRow key={item.id}>
                  {/* Actions cell for clientes only */}
                  {dataType === 'clientes' && (
                    <TableCell className="sticky z-10 bg-gray-50 border-r border-gray-200" style={{ left: 0 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(item as Client)}
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </TableCell>
                  )}
                  {getOrderedColumns().map((column) => {
                    const isPinned = pinnedColumns.includes(column.key);
                    const isFirstColumn = column.key === (dataType === 'apartamentos' ? 'apartamento' : 'numero_identificacion');
                    const stickyLeft = getStickyPosition(column.key);
                    const isEditing = editingCell?.rowId === item.id && editingCell?.column === column.key;

                    // Adjust sticky position for clientes to account for actions column
                    const adjustedStickyLeft = dataType === 'clientes' && (isFirstColumn || isPinned)
                      ? (stickyLeft !== null ? stickyLeft + 128 : 128)
                      : stickyLeft;

                    let cellValue: string | number | boolean | null | undefined;
                    if (dataType === 'apartamentos') {
                      const apt = item as Apartamento;
                      cellValue = apt[column.key as keyof Apartamento];
                    } else {
                      const client = item as Client;
                      cellValue = client[column.key as keyof Client];
                    }

                    const cellClasses = [
                      dataType === 'apartamentos' && ['area_construida', 'valor_mt2', 'area_terraza', 'valor_mt2_terraza', 'valor_terraza', 'valor_ac', 'valor_total', 'cuota_inicial_pct', 'cuota_inicial_valor', 'separacion_5', 'saldo_inicial', 'cuota_mensual_mes1', 'saldo_contra_escrituracion'].includes(column.key) ? 'text-right' : '',
                      dataType === 'clientes' && ['total_activos', 'total_pasivos', 'total_ingresos_mensuales', 'total_egresos_mensuales', 'total_otros_ingresos', 'valor_recurso'].includes(column.key) ? 'text-right' : '',
                      column.key === 'vendido' ? 'text-center' : '',
                      dataType === 'clientes' && ['pep', 'familiar_pep', 'obligado_tributar_usa', 'obligado_tributar_otros_paises', 'realiza_operaciones_moneda_extranjera', 'recursos_dependen_tercero'].includes(column.key) ? 'text-center' : '',
                      dataType === 'clientes' && ['direccion_residencia', 'direccion_laboral'].includes(column.key) ? 'max-w-xs truncate' : '',
                      (isFirstColumn || isPinned) ? 'sticky z-10' : '',
                      (isFirstColumn || isPinned) ? 'bg-gray-50 border-r border-gray-200' : '',
                      isPinned ? 'bg-blue-50 border-blue-200' : '',
                      isFirstColumn ? 'text-gray-900' : column.key === 'primer_nombre' || column.key === 'valor_total' ? 'text-gray-900' : 'text-gray-700',
                      isEditing ? 'bg-yellow-50' : '',
                      isEditMode && !['vendido', 'pep', 'familiar_pep', 'obligado_tributar_usa', 'obligado_tributar_otros_paises', 'realiza_operaciones_moneda_extranjera', 'recursos_dependen_tercero'].includes(column.key) ? 'cursor-pointer hover:bg-gray-100' : ''
                    ].filter(Boolean).join(' ');

                    const style = (isFirstColumn || isPinned) ? { left: `${adjustedStickyLeft}px` } : {};

                    const renderCellContent = () => {
                      if (isEditing) {
                        return (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-8 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={handleSaveEdit}
                                disabled={savingChanges}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      }

                      // Format display value based on column type
                      if (column.key === 'vendido') {
                        return (
                          <Badge
                            variant={cellValue ? 'destructive' : 'default'}
                            className={`px-3 py-1 text-sm ${
                              cellValue
                                ? 'bg-gray-900 text-white hover:bg-gray-800'
                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            }`}
                          >
                            {cellValue ? 'Vendido' : 'Disponible'}
                          </Badge>
                        );
                      }

                      // Apartamentos formatting
                      if (dataType === 'apartamentos' && (['valor_mt2', 'valor_mt2_terraza', 'valor_terraza', 'valor_ac', 'valor_total', 'cuota_inicial_valor', 'separacion_5', 'saldo_inicial', 'cuota_mensual_mes1', 'saldo_contra_escrituracion'].includes(column.key))) {
                        return formatCurrency(Number(cellValue) || 0);
                      }

                      if (dataType === 'apartamentos' && ['area_construida', 'area_terraza'].includes(column.key)) {
                        return `${(Number(cellValue) || 0).toLocaleString()} m²`;
                      }

                      if (dataType === 'apartamentos' && column.key === 'cuota_inicial_pct') {
                        return `${(Number(cellValue) || 0).toFixed(1)}%`;
                      }

                      // Clientes boolean fields
                      if (dataType === 'clientes' && ['pep', 'familiar_pep', 'obligado_tributar_usa', 'obligado_tributar_otros_paises', 'realiza_operaciones_moneda_extranjera', 'recursos_dependen_tercero'].includes(column.key)) {
                        return (
                          <Badge
                            variant={cellValue ? 'default' : 'secondary'}
                            className={`px-3 py-1 text-sm ${
                              cellValue
                                ? 'bg-gray-900 text-white hover:bg-gray-800'
                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            }`}
                          >
                            {cellValue ? 'Sí' : 'No'}
                          </Badge>
                        );
                      }

                      // Clientes financial fields (currency)
                      if (dataType === 'clientes' && ['total_activos', 'total_pasivos', 'total_ingresos_mensuales', 'total_egresos_mensuales', 'total_otros_ingresos', 'valor_recurso'].includes(column.key)) {
                        return cellValue ? formatCurrency(Number(cellValue)) : '-';
                      }

                      // Clientes date fields
                      if (dataType === 'clientes' && ['fecha_expedicion', 'fecha_nacimiento'].includes(column.key)) {
                        return cellValue ? new Date(cellValue as string).toLocaleDateString('es-CO') : '-';
                      }

                      // Clientes contact fields
                      if (dataType === 'clientes' && column.key === 'celular' && cellValue) {
                        return (
                          <a href={`tel:${cellValue}`} className="hover:underline">
                            {cellValue}
                          </a>
                        );
                      }

                      if (dataType === 'clientes' && column.key === 'correo_electronico' && cellValue) {
                        return (
                          <a href={`mailto:${cellValue}`} className="hover:underline">
                            {cellValue}
                          </a>
                        );
                      }

                      return cellValue || '-';
                    };

                    return (
                      <TableCell
                        key={column.key}
                        className={cellClasses}
                        style={style}
                        title={dataType === 'clientes' && ['direccion_residencia', 'direccion_laboral'].includes(column.key) ? String(cellValue || '') : undefined}
                        onClick={() => isEditMode && !['vendido', 'pep', 'familiar_pep', 'obligado_tributar_usa', 'obligado_tributar_otros_paises', 'realiza_operaciones_moneda_extranjera', 'recursos_dependen_tercero'].includes(column.key) ? handleCellEdit(item.id, column.key, cellValue) : undefined}
                      >
                        {renderCellContent()}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {totalPages > 1 && (
        <div className="text-center text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
      )}

      {/* Client Document Modal */}
      <ClientDocumentModal
        client={selectedClient}
        open={isDocumentModalOpen}
        onOpenChange={setIsDocumentModalOpen}
      />
    </div>
  );
}