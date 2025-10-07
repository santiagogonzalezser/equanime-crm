import { generateClientPDF } from '@/lib/pdf-generator';
import type { Client } from '@/types';
import jsPDF from 'jspdf';

// Mock jsPDF
jest.mock('jspdf');

describe('generateClientPDF', () => {
  let mockDoc: {
    setFontSize: jest.Mock;
    setFont: jest.Mock;
    text: jest.Mock;
    splitTextToSize: jest.Mock;
    addPage: jest.Mock;
    save: jest.Mock;
  };

  const mockClient: Client = {
    id: '123',
    primer_nombre: 'Santiago',
    segundo_nombre: 'José',
    primer_apellido: 'Gonzalez',
    segundo_apellido: 'Serna',
    numero_identificacion: '1126644106',
    tipo_identificacion: 'CC',
    fecha_expedicion: '2019-08-22',
    ciudad_expedicion: 'Bogotá D.C.',
    fecha_nacimiento: '2001-08-17',
    genero: 'Masculino',
    nacionalidad: 'Colombiana',
    pais_nacimiento: 'Colombia',
    ciudad_nacimiento: 'Naucalpan de Juarez',
    departamento_nacimiento: null,
    estado_civil: 'Soltero',
    segunda_nacionalidad: null,
    correo_electronico: 'santiago@test.com',
    celular: '3001234567',
    direccion_residencia: 'Calle 123 #45-67',
    pais_residencia: 'Colombia',
    departamento_residencia: 'Cundinamarca',
    ciudad_residencia: 'Bogotá',
    codigo_postal: '110111',
    ocupacion: 'Ingeniero',
    tipo_vinculacion_laboral: 'Empleado',
    empresa: 'Tech Corp',
    cargo: 'Developer',
    direccion_laboral: 'Av 123',
    descripcion_ciiu: 'Tecnología',
    codigo_ciiu: '6201',
    total_activos: 100000,
    total_pasivos: 50000,
    total_ingresos_mensuales: 5000,
    total_egresos_mensuales: 3000,
    total_otros_ingresos: 500,
    pep: false,
    familiar_pep: false,
    obligado_tributar_usa: false,
    obligado_tributar_otros_paises: false,
    realiza_operaciones_moneda_extranjera: false,
    recursos_dependen_tercero: false,
    recurso: null,
    valor_recurso: null,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  };

  beforeEach(() => {
    // Reset mocks
    mockDoc = {
      setFontSize: jest.fn(),
      setFont: jest.fn(),
      text: jest.fn(),
      splitTextToSize: jest.fn((text: string) => [text]),
      addPage: jest.fn(),
      save: jest.fn(),
    };

    (jsPDF as unknown as jest.Mock).mockImplementation(() => mockDoc);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create PDF with client name in filename', () => {
    generateClientPDF(mockClient);

    expect(mockDoc.save).toHaveBeenCalledWith(
      expect.stringMatching(/^cliente_Santiago_Gonzalez_\d{4}-\d{2}-\d{2}\.pdf$/)
    );
  });

  it('should handle null second name and surname in filename', () => {
    const clientWithoutSecondNames = {
      ...mockClient,
      segundo_nombre: null,
      segundo_apellido: null,
    };

    generateClientPDF(clientWithoutSecondNames);

    expect(mockDoc.save).toHaveBeenCalledWith(
      expect.stringMatching(/^cliente_Santiago_Gonzalez_\d{4}-\d{2}-\d{2}\.pdf$/)
    );
  });

  it('should handle null fields gracefully', () => {
    const clientWithNulls = {
      ...mockClient,
      segundo_nombre: null,
      departamento_nacimiento: null,
      segunda_nacionalidad: null,
    };

    expect(() => generateClientPDF(clientWithNulls)).not.toThrow();
  });

  it('should include all section headers in Spanish', () => {
    generateClientPDF(mockClient);

    const textCalls = mockDoc.text.mock.calls.map(call => call[0]);

    expect(textCalls).toContain('EQUÁNIME CRM - Información del Cliente');
    expect(textCalls.some((call: string) => call.includes('Identificación'))).toBe(true);
    expect(textCalls.some((call: string) => call.includes('Información Personal'))).toBe(true);
    expect(textCalls.some((call: string) => call.includes('Información de Contacto'))).toBe(true);
    expect(textCalls.some((call: string) => call.includes('Información Laboral'))).toBe(true);
    expect(textCalls.some((call: string) => call.includes('Información Financiera'))).toBe(true);
    expect(textCalls.some((call: string) => call.includes('Información de Cumplimiento'))).toBe(true);
  });

  it('should create PDF instance with correct parameters', () => {
    generateClientPDF(mockClient);

    expect(jsPDF).toHaveBeenCalledWith('p', 'mm', 'a4');
  });

  it('should display null values as "-"', () => {
    const clientWithNull = {
      ...mockClient,
      segundo_nombre: null,
    };

    generateClientPDF(clientWithNull);

    // Check that splitTextToSize was called with text containing "-" for null field
    const splitCalls = mockDoc.splitTextToSize.mock.calls.map(call => call[0]);
    const secondNameCalls = splitCalls.filter((call: string) =>
      call.includes('Segundo Nombre')
    );

    expect(secondNameCalls.some((call: string) => call.includes(': -'))).toBe(true);
  });

  it('should format client full name in header', () => {
    generateClientPDF(mockClient);

    expect(mockDoc.text).toHaveBeenCalledWith(
      'Santiago José Gonzalez Serna',
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('should handle boolean values correctly', () => {
    const clientWithBooleans = {
      ...mockClient,
      pep: true,
      familiar_pep: false,
    };

    expect(() => generateClientPDF(clientWithBooleans)).not.toThrow();
  });

  it('should handle number values correctly', () => {
    generateClientPDF(mockClient);

    // Check splitTextToSize calls instead of text calls
    const splitCalls = mockDoc.splitTextToSize.mock.calls.map(call => call[0]);
    const financialCalls = splitCalls.filter(
      (call: string) => typeof call === 'string' && call.includes('Total Activos')
    );

    expect(financialCalls.length).toBeGreaterThan(0);
  });
});
