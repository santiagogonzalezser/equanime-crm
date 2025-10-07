/**
 * Tests for OCR Document Extraction API Route
 * Following TDD approach - tests written before implementation
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ocr/extract-document/route';

// Mock OpenAI SDK
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

const originalEnv = process.env;

beforeAll(() => {
  process.env = {
    ...originalEnv,
    OPENAI_API_KEY: 'test-api-key',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('POST /api/ocr/extract-document', () => {
  let mockOpenAI: {
    chat: {
      completions: {
        create: jest.Mock;
      };
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const OpenAI = require('openai').default;
    mockOpenAI = new OpenAI();
  });

  describe('File Validation', () => {
    test('returns 400 if no file is provided', async () => {
      const formData = new FormData();
      const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No file provided');
    });

    test('returns 400 if file is too large (>10MB)', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      const file = new File([largeBuffer], 'large.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('File too large (max 10MB)');
    });

    test('returns 400 if file type is invalid', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid file type');
    });

    test('accepts valid image types (jpeg, jpg, png)', async () => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];

      for (const type of validTypes) {
        const file = new File(['test-image'], 'test.jpg', { type });
        const formData = new FormData();
        formData.append('file', file);

        mockOpenAI.chat.completions.create.mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  tipo_identificacion: 'CC',
                  numero_identificacion: '1234567890',
                }),
              },
            },
          ],
        });

        const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
          method: 'POST',
          body: formData,
        });

        const response = await POST(request);
        expect(response.status).not.toBe(400);
      }
    });
  });

  describe('OpenAI Vision Integration', () => {
    test('calls OpenAI with correct model and parameters', async () => {
      const file = new File(['test-image'], 'cedula.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                tipo_identificacion: 'CC',
                numero_identificacion: '1234567890',
              }),
            },
          },
        ],
      });

      const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
          max_tokens: 500,
          temperature: 0.1,
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.arrayContaining([
                expect.objectContaining({ type: 'text' }),
                expect.objectContaining({ type: 'image_url' }),
              ]),
            }),
          ]),
        })
      );
    });

    test('converts file to base64 correctly', async () => {
      const testContent = 'test-image-content';
      const file = new File([testContent], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                tipo_identificacion: 'CC',
              }),
            },
          },
        ],
      });

      const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const imageUrl = callArgs.messages[0].content[1].image_url.url;

      expect(imageUrl).toMatch(/^data:image\/jpeg;base64,/);
    });

    test('returns extracted data on successful OCR', async () => {
      const file = new File(['test'], 'cedula.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const mockExtractedData = {
        tipo_identificacion: 'CC',
        numero_identificacion: '1234567890',
        fecha_expedicion: '2020-05-15',
        ciudad_expedicion: 'BOGOTA D.C.',
        primer_nombre: 'JUAN',
        segundo_nombre: 'CARLOS',
        primer_apellido: 'RODRIGUEZ',
        segundo_apellido: 'GOMEZ',
        fecha_nacimiento: '1990-04-25',
        genero: 'Masculino',
        nacionalidad: 'Colombiana',
        pais_nacimiento: null,
        ciudad_nacimiento: null,
        departamento_nacimiento: null,
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockExtractedData),
            },
          },
        ],
      });

      const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockExtractedData);
    });

    test('handles GPT response with markdown code blocks', async () => {
      const file = new File(['test'], 'cedula.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const mockData = { tipo_identificacion: 'CC', numero_identificacion: '123' };

      // Simulate GPT response wrapped in markdown
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: '```json\n' + JSON.stringify(mockData) + '\n```',
            },
          },
        ],
      });

      const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockData);
    });
  });

  describe('Error Handling', () => {
    test('returns 422 if no JSON found in response', async () => {
      const file = new File(['test'], 'cedula.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'No valid JSON here',
            },
          },
        ],
      });

      const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.error).toBe('Could not extract data from document');
    });

    test('handles OpenAI rate limit error (429)', async () => {
      const file = new File(['test'], 'cedula.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const rateLimitError = Object.assign(new Error('Rate limit exceeded'), {
        response: { status: 429 }
      });
      mockOpenAI.chat.completions.create.mockRejectedValue(rateLimitError);

      const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded. Please try again later.');
    });

    test('handles OpenAI authentication error (401)', async () => {
      const file = new File(['test'], 'cedula.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const authError = Object.assign(new Error('Unauthorized'), {
        response: { status: 401 }
      });
      mockOpenAI.chat.completions.create.mockRejectedValue(authError);

      const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Invalid API key configuration');
    });

    test('handles generic errors gracefully', async () => {
      const file = new File(['test'], 'cedula.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to process document');
    });
  });

  describe('Data Extraction Quality', () => {
    test('extracts all required Colombian ID fields', async () => {
      const file = new File(['test'], 'cedula.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const completeData = {
        tipo_identificacion: 'CC',
        numero_identificacion: '1234567890',
        fecha_expedicion: '2020-05-15',
        ciudad_expedicion: 'BOGOTA D.C.',
        primer_nombre: 'JUAN',
        segundo_nombre: 'CARLOS',
        primer_apellido: 'RODRIGUEZ',
        segundo_apellido: 'GOMEZ',
        fecha_nacimiento: '1990-04-25',
        genero: 'Masculino',
        nacionalidad: 'Colombiana',
        pais_nacimiento: 'Colombia',
        ciudad_nacimiento: 'BOGOTA',
        departamento_nacimiento: 'CUNDINAMARCA',
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(completeData) } }],
      });

      const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data).toHaveProperty('tipo_identificacion');
      expect(data.data).toHaveProperty('numero_identificacion');
      expect(data.data).toHaveProperty('primer_nombre');
      expect(data.data).toHaveProperty('primer_apellido');
      expect(data.data).toHaveProperty('fecha_nacimiento');
      expect(data.data).toHaveProperty('genero');
    });

    test('handles null values for optional fields', async () => {
      const file = new File(['test'], 'cedula.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const partialData = {
        tipo_identificacion: 'CC',
        numero_identificacion: '1234567890',
        fecha_expedicion: null,
        ciudad_expedicion: null,
        primer_nombre: 'JUAN',
        segundo_nombre: null,
        primer_apellido: 'RODRIGUEZ',
        segundo_apellido: null,
        fecha_nacimiento: '1990-04-25',
        genero: 'Masculino',
        nacionalidad: 'Colombiana',
        pais_nacimiento: null,
        ciudad_nacimiento: null,
        departamento_nacimiento: null,
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(partialData) } }],
      });

      const request = new NextRequest('http://localhost:3001/api/ocr/extract-document', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.segundo_nombre).toBeNull();
      expect(data.data.pais_nacimiento).toBeNull();
    });
  });
});
