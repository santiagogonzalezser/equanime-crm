import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // 1. Get files from FormData
    const formData = await request.formData();
    const files: File[] = [];

    // Get all files (support both 'file' and 'files[]')
    for (const [key, value] of formData.entries()) {
      if ((key === 'file' || key.startsWith('files')) && value instanceof File) {
        files.push(value);
      }
    }

    // Validation
    if (files.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (files.length > 2) {
      return NextResponse.json({ error: 'Maximum 2 files allowed' }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    for (const file of files) {
      if (file.size > maxSize) {
        return NextResponse.json({ error: `File ${file.name} too large (max 10MB)` }, { status: 400 });
      }
      if (!validTypes.includes(file.type)) {
        return NextResponse.json({ error: `Invalid file type for ${file.name}` }, { status: 400 });
      }
    }

    // 2. Convert all files to base64
    const base64Images: string[] = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      const mimeType = file.type;
      base64Images.push(`data:${mimeType};base64,${base64}`);
    }

    // 3. Call OpenAI Vision API
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('=== OpenAI Configuration ===');
    console.log('API Key present:', !!apiKey);
    console.log('API Key prefix:', apiKey?.substring(0, 7));

    if (!apiKey) {
      console.error('OPENAI_API_KEY environment variable is not set');
      return NextResponse.json({
        error: 'OpenAI API key not configured'
      }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Build content array with text and all images
    type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
    const contentArray: ContentPart[] = [
      {
        type: "text",
        text: `You are a document data extraction API. Extract all personal information from this Colombian ID document${base64Images.length > 1 ? ' (analyzing both sides)' : ''} (Cédula de Ciudadanía, Cédula de Extranjería, or Pasaporte).

${base64Images.length > 1 ? 'You are seeing both the front and back of the document. Combine information from both sides.' : 'You are seeing one side of the document. Extract all available information.'}

CRITICAL: You MUST respond with ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks. Just the raw JSON object.

If the image is not a Colombian ID document, or if you cannot read it, respond with this JSON:
{"error": "Cannot read document - image may be blurry, rotated, or not a Colombian ID"}

Otherwise, return a JSON object with these exact fields (use null for missing/unreadable fields):
{
  "tipo_identificacion": "CC" | "CE" | "Pasaporte" | "TI",
  "numero_identificacion": "string (ID number)",
  "fecha_expedicion": "YYYY-MM-DD",
  "ciudad_expedicion": "string",
  "primer_nombre": "string (first given name)",
  "segundo_nombre": "string (second given name) or null",
  "primer_apellido": "string (first surname)",
  "segundo_apellido": "string (second surname) or null",
  "fecha_nacimiento": "YYYY-MM-DD",
  "genero": "Masculino" | "Femenino" | "Otro",
  "nacionalidad": "Colombiana" | "string",
  "pais_nacimiento": "Colombia" | "string" or null,
  "ciudad_nacimiento": "string or null",
  "departamento_nacimiento": "string or null"
}

Conversion rules:
- Convert dates from "DD MMM YYYY" to "YYYY-MM-DD" format
- Parse full names correctly (Colombian convention: two first names, two surnames)
- Map M→Masculino, F→Femenino
- Combine information from all images provided

REMEMBER: Return ONLY the JSON object. No markdown, no explanation, no code blocks. Just pure JSON.`
      }
    ];

    // Add all images to content array
    for (const base64Image of base64Images) {
      contentArray.push({
        type: "image_url",
        image_url: {
          url: base64Image
        }
      });
    }

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: contentArray
          }
        ],
        max_tokens: 500,
        temperature: 0.1, // Low temperature for consistent extraction
      });
      console.log('=== OpenAI API Call Successful ===');
      console.log('Model used:', completion.model);
      console.log('Tokens used:', completion.usage);
    } catch (openaiError) {
      console.error('=== OpenAI API Call Failed ===');
      console.error('Error:', openaiError);
      throw openaiError; // Will be caught by outer catch block
    }

    // 4. Parse response
    const responseText = completion.choices[0]?.message?.content;
    console.log('=== OpenAI Response ===');
    console.log('Raw response text:', responseText);
    console.log('Response text type:', typeof responseText);
    console.log('Response text length:', responseText?.length);

    if (!responseText) {
      console.error('OpenAI returned empty response');
      return NextResponse.json({
        error: 'No se pudo extraer información del documento. La respuesta de OpenAI está vacía.'
      }, { status: 422 });
    }

    // Extract JSON from response (handle cases where GPT includes markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('=== No JSON found in OpenAI response ===');
      console.error('Response was:', responseText);
      return NextResponse.json({
        error: 'No se pudo extraer información del documento. El documento puede estar borroso, incompleto, o no ser una identificación colombiana válida. Respuesta: ' + responseText.substring(0, 200)
      }, { status: 422 });
    }

    console.log('Matched JSON string:', jsonMatch[0]);

    let extractedData;
    try {
      extractedData = JSON.parse(jsonMatch[0]);
      console.log('Parsed extracted data:', JSON.stringify(extractedData, null, 2));
    } catch (parseError) {
      console.error('=== JSON Parse Error ===');
      console.error('Parse error:', parseError);
      console.error('Attempted to parse:', jsonMatch[0]);
      return NextResponse.json({
        error: 'Error al parsear los datos extraídos. JSON inválido.'
      }, { status: 422 });
    }

    // Check if GPT returned an error response
    if (extractedData.error) {
      console.error('=== GPT returned error ===');
      console.error('Error from GPT:', extractedData.error);
      return NextResponse.json({
        error: extractedData.error
      }, { status: 422 });
    }

    // 5. Return extracted data
    return NextResponse.json({
      success: true,
      data: extractedData
    });

  } catch (error: unknown) {
    console.error('=== OCR API Error ===');
    console.error('Error type:', typeof error);
    console.error('Error:', error);

    // Extract detailed error information
    if (error && typeof error === 'object') {
      const err = error as any;
      console.error('Error message:', err.message);
      console.error('Error status:', err.status);
      console.error('Error code:', err.code);
      console.error('Error response:', err.response);

      // Handle OpenAI specific errors
      if (err.status === 429) {
        return NextResponse.json({
          error: 'Rate limit exceeded. Please try again later.'
        }, { status: 429 });
      }

      if (err.status === 401) {
        console.error('OpenAI API Key Error - Check if key is valid and has credits');
        return NextResponse.json({
          error: 'Invalid API key or no credits available'
        }, { status: 500 });
      }

      if (err.status === 400) {
        console.error('OpenAI Bad Request:', err.message);
        return NextResponse.json({
          error: `OpenAI error: ${err.message || 'Bad request'}`
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: 'Failed to process document. Check server logs for details.'
    }, { status: 500 });
  }
}
