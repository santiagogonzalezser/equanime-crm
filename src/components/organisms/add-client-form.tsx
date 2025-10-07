/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase';
import FileUpload from '@/components/atoms/file-upload';
import {
  stepSchemas,
  clientFormSchema,
  STEP_TITLES,
  TIPO_IDENTIFICACION_OPTIONS,
  GENERO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  TIPO_VINCULACION_OPTIONS,
} from '@/lib/form-schemas';
export default function AddClientForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Memoize the resolver to prevent unnecessary re-renders
  const currentResolver = useMemo(
    () => zodResolver(currentStep < 6 ? stepSchemas[currentStep] : clientFormSchema) as any,
    [currentStep]
  );

  const form = useForm<any>({
    resolver: currentResolver,
    mode: 'onBlur',
    defaultValues: {
      tipo_identificacion: null,
      numero_identificacion: '',
      fecha_expedicion: null,
      ciudad_expedicion: null,
      primer_nombre: '',
      segundo_nombre: null,
      primer_apellido: '',
      segundo_apellido: null,
      fecha_nacimiento: null,
      pais_nacimiento: null,
      departamento_nacimiento: null,
      ciudad_nacimiento: null,
      genero: null,
      estado_civil: null,
      nacionalidad: null,
      segunda_nacionalidad: null,
      correo_electronico: null,
      celular: null,
      direccion_residencia: null,
      pais_residencia: null,
      departamento_residencia: null,
      ciudad_residencia: null,
      codigo_postal: null,
      ocupacion: null,
      tipo_vinculacion_laboral: null,
      empresa: null,
      cargo: null,
      direccion_laboral: null,
      descripcion_ciiu: null,
      codigo_ciiu: null,
      total_activos: null,
      total_pasivos: null,
      total_ingresos_mensuales: null,
      total_egresos_mensuales: null,
      total_otros_ingresos: null,
      pep: false,
      familiar_pep: false,
      obligado_tributar_usa: false,
      obligado_tributar_otros_paises: false,
      realiza_operaciones_moneda_extranjera: false,
      recursos_dependen_tercero: false,
      recurso: null,
      valor_recurso: null,
    },
  });

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('client-form-draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        form.reset(parsedDraft);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, [form]);

  // Auto-save to localStorage
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('client-form-draft', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleFileUpload = async (files: File[]) => {
    setIsProcessing(true);

    try {
      // Call API
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });

      const response = await fetch('/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Error al procesar el documento';
        try {
          const result = await response.json();
          errorMessage = result.error || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        toast.error(errorMessage);
        console.error('API Error:', errorMessage);
        return;
      }

      const result = await response.json();
      console.log('=== OCR API Response ===');
      console.log('Full result:', JSON.stringify(result, null, 2));

      // Auto-fill form fields
      const data = result.data;
      console.log('Extracted data:', JSON.stringify(data, null, 2));

      if (!data) {
        console.error('No data found in API response');
        toast.error('No se pudieron extraer datos del documento');
        return;
      }

      // Get current form values
      const currentValues = form.getValues();
      console.log('Current form values before merge:', currentValues);

      // Merge extracted data with current form values
      const updatedValues = {
        ...currentValues,
        // Only set non-null, non-undefined, non-empty values from OCR
        ...(data.tipo_identificacion && { tipo_identificacion: data.tipo_identificacion }),
        ...(data.numero_identificacion && { numero_identificacion: data.numero_identificacion }),
        ...(data.fecha_expedicion && { fecha_expedicion: data.fecha_expedicion }),
        ...(data.ciudad_expedicion && { ciudad_expedicion: data.ciudad_expedicion }),
        ...(data.primer_nombre && { primer_nombre: data.primer_nombre }),
        ...(data.segundo_nombre && { segundo_nombre: data.segundo_nombre }),
        ...(data.primer_apellido && { primer_apellido: data.primer_apellido }),
        ...(data.segundo_apellido && { segundo_apellido: data.segundo_apellido }),
        ...(data.fecha_nacimiento && { fecha_nacimiento: data.fecha_nacimiento }),
        ...(data.genero && { genero: data.genero }),
        ...(data.nacionalidad && { nacionalidad: data.nacionalidad }),
        ...(data.pais_nacimiento && { pais_nacimiento: data.pais_nacimiento }),
        ...(data.ciudad_nacimiento && { ciudad_nacimiento: data.ciudad_nacimiento }),
        ...(data.departamento_nacimiento && { departamento_nacimiento: data.departamento_nacimiento }),
      };

      console.log('Updated form values after merge:', updatedValues);

      // Use form.reset() instead of multiple setValue() calls
      // This is more reliable with dynamic resolvers
      form.reset(updatedValues, {
        keepDefaultValues: false,
        keepDirty: false,
        keepTouched: false
      });

      console.log('Form values after reset:', form.getValues());

      toast.success('Datos extraídos exitosamente del documento');

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al procesar el documento. Intente nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearUpload = () => {
    // Optional: could clear form fields here if desired
  };

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid && currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();

      // Clean up the data before submission
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
          // Handle empty strings -> null
          if (value === '') return [key, null];

          // Keep date fields as YYYY-MM-DD strings (no conversion to Date objects)
          // This prevents timezone shifts
          if ((key === 'fecha_nacimiento' || key === 'fecha_expedicion') && typeof value === 'string') {
            console.log(`Date field ${key}: "${value}" (keeping as string)`);
            return [key, value];
          }

          return [key, value];
        })
      );

      console.log('=== Submitting to Supabase ===');
      console.log('Data being inserted:', cleanedData);

      const { error } = await supabase
        .from('clientes')
        .insert([cleanedData]);

      if (error) {
        if (error.code === '23505') {
          toast.error('El documento o correo electrónico ya está registrado');
          return;
        }
        throw error;
      }

      localStorage.removeItem('client-form-draft');
      toast.success('Cliente agregado exitosamente');
      router.push('/tables');
    } catch (error) {
      console.error('Error al crear cliente:', error);
      toast.error('Error al crear el cliente. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderIdentificacionStep = () => (
    <div className="space-y-6">
      {/* OCR Document Upload */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Escanear Documento (Opcional)
        </h3>
        <FileUpload
          onExtract={handleFileUpload}
          onClear={handleClearUpload}
          isProcessing={isProcessing}
        />
      </div>

      {/* Existing fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
        control={form.control}
        name="tipo_identificacion"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Tipo de Identificación</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TIPO_IDENTIFICACION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="numero_identificacion"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Número de Identificación *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ingrese el número" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="fecha_expedicion"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Fecha de Expedición</FormLabel>
            <FormControl>
              <Input type="date" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="ciudad_expedicion"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Ciudad de Expedición</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Ciudad" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="primer_nombre"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Primer Nombre *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nombre" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="segundo_nombre"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Segundo Nombre</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Nombre" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="primer_apellido"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Primer Apellido *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Apellido" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="segundo_apellido"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Segundo Apellido</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Apellido" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      </div>
    </div>
  );

  const renderPersonalStep = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="fecha_nacimiento"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Fecha de Nacimiento</FormLabel>
            <FormControl>
              <Input type="date" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="genero"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Género</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {GENERO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="pais_nacimiento"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>País de Nacimiento</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="País" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="departamento_nacimiento"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Departamento de Nacimiento</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Departamento" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="ciudad_nacimiento"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Ciudad de Nacimiento</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Ciudad" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="estado_civil"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Estado Civil</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ESTADO_CIVIL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="nacionalidad"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Nacionalidad</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Nacionalidad" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="segunda_nacionalidad"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Segunda Nacionalidad</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Segunda nacionalidad" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderContactStep = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="correo_electronico"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Correo Electrónico</FormLabel>
            <FormControl>
              <Input type="email" {...field} value={field.value || ''} placeholder="correo@ejemplo.com" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="celular"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Celular</FormLabel>
            <FormControl>
              <Input type="tel" {...field} value={field.value || ''} placeholder="3001234567" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="direccion_residencia"
        render={({ field }: any) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Dirección de Residencia</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Calle, número, apartamento" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="pais_residencia"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>País de Residencia</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="País" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="departamento_residencia"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Departamento de Residencia</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Departamento" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="ciudad_residencia"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Ciudad de Residencia</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Ciudad" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="codigo_postal"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Código Postal</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="110111" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderEmploymentStep = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="ocupacion"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Ocupación</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Profesión u oficio" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tipo_vinculacion_laboral"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Tipo de Vinculación Laboral</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TIPO_VINCULACION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="empresa"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Empresa</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Nombre de la empresa" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="cargo"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Cargo</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Cargo o posición" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="direccion_laboral"
        render={({ field }: any) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Dirección Laboral</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Dirección del lugar de trabajo" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="codigo_ciiu"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Código CIIU</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Código" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="descripcion_ciiu"
        render={({ field}) => (
          <FormItem>
            <FormLabel>Descripción CIIU</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} placeholder="Descripción" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderFinancialStep = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="total_activos"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Total Activos</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                {...field}
                value={field.value === null ? '' : field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                placeholder="0.00"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="total_pasivos"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Total Pasivos</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                {...field}
                value={field.value === null ? '' : field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                placeholder="0.00"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="total_ingresos_mensuales"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Total Ingresos Mensuales</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                {...field}
                value={field.value === null ? '' : field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                placeholder="0.00"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="total_egresos_mensuales"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Total Egresos Mensuales</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                {...field}
                value={field.value === null ? '' : field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                placeholder="0.00"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="total_otros_ingresos"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Total Otros Ingresos</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                {...field}
                value={field.value === null ? '' : field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                placeholder="0.00"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderComplianceStep = () => {
    const recursosDependendeTercero = form.watch('recursos_dependen_tercero');

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="pep"
            render={({ field }: any) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Persona Expuesta Políticamente (PEP)
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="familiar_pep"
            render={({ field }: any) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Familiar de PEP
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="obligado_tributar_usa"
            render={({ field }: any) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Obligado a Tributar en USA
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="obligado_tributar_otros_paises"
            render={({ field }: any) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Obligado a Tributar en Otros Países
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="realiza_operaciones_moneda_extranjera"
            render={({ field }: any) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Realiza Operaciones en Moneda Extranjera
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="recursos_dependen_tercero"
            render={({ field }: any) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Recursos Dependen de Tercero
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {recursosDependendeTercero && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <FormField
              control={form.control}
              name="recurso"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Especifique el Recurso *</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="Descripción del recurso" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valor_recurso"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Valor del Recurso</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    );
  };

  const renderReviewStep = () => {
    const formData = form.getValues();

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revise la información antes de enviar</h3>
          <p className="text-sm text-gray-600">Asegúrese de que todos los datos sean correctos</p>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Identificación</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">Tipo:</span> {formData.tipo_identificacion || '-'}</div>
              <div><span className="font-medium">Número:</span> {formData.numero_identificacion || '-'}</div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Información Personal</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">Nombre:</span> {`${formData.primer_nombre || ''} ${formData.segundo_nombre || ''} ${formData.primer_apellido || ''} ${formData.segundo_apellido || ''}`.trim() || '-'}</div>
              <div><span className="font-medium">Género:</span> {formData.genero || '-'}</div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Contacto</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">Email:</span> {formData.correo_electronico || '-'}</div>
              <div><span className="font-medium">Celular:</span> {formData.celular || '-'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Agregar nuevo cliente
        </CardTitle>
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Paso {currentStep + 1} de 7</span>
            <span>{STEP_TITLES[currentStep]}</span>
          </div>
          <Progress value={((currentStep + 1) / 7) * 100} />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {currentStep === 0 && renderIdentificacionStep()}
            {currentStep === 1 && renderPersonalStep()}
            {currentStep === 2 && renderContactStep()}
            {currentStep === 3 && renderEmploymentStep()}
            {currentStep === 4 && renderFinancialStep()}
            {currentStep === 5 && renderComplianceStep()}
            {currentStep === 6 && renderReviewStep()}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Anterior
        </Button>
        {currentStep < 6 ? (
          <Button type="button" onClick={handleNext}>
            Siguiente
          </Button>
        ) : (
          <Button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
