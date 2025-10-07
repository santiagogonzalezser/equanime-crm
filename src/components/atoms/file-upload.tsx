'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Sparkles, Plus, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onExtract: (files: File[]) => void;
  onClear: () => void;
  isProcessing: boolean;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUpload({
  onExtract,
  onClear,
  isProcessing,
  accept = 'image/jpeg,image/png,image/jpg',
  maxSizeMB = 10,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > 2) {
      alert('Puede subir máximo 2 imágenes en total');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    // Validate size for all files
    const maxSize = maxSizeMB * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxSize) {
        alert(`El archivo ${file.name} es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }
    }

    // Create previews for all new files
    const newPreviews: string[] = [];
    const newFileNames: string[] = [];
    let loadedCount = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        newFileNames.push(file.name);
        loadedCount++;

        if (loadedCount === files.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
          setFileNames(prev => [...prev, ...newFileNames]);
          setSelectedFiles(prev => [...prev, ...files]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleExtract = () => {
    if (selectedFiles.length === 0) return;

    // Show inline warning if only 1 file uploaded
    if (selectedFiles.length === 1 && !showWarning) {
      setShowWarning(true);
      return;
    }

    // Proceed with extraction
    setShowWarning(false);
    onExtract(selectedFiles);
  };

  const handleProceedWithWarning = () => {
    setShowWarning(false);
    onExtract(selectedFiles);
  };

  const handleCancelWarning = () => {
    setShowWarning(false);
  };

  const handleRemoveFile = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFileNames = fileNames.filter((_, i) => i !== index);
    const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);

    setPreviews(newPreviews);
    setFileNames(newFileNames);
    setSelectedFiles(newSelectedFiles);
    setShowWarning(false);

    // If all files removed, call onClear
    if (newPreviews.length === 0) {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      onClear();
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isProcessing || selectedFiles.length >= 2}
        multiple
      />

      {previews.length === 0 ? (
        <Button
          type="button"
          onClick={handleClick}
          disabled={isProcessing}
          variant="outline"
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando documento...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir foto(s) del documento
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-4 grid-cols-2">
            {/* First photo */}
            <div className="relative rounded-lg border border-gray-200 p-4">
              <button
                type="button"
                onClick={() => handleRemoveFile(0)}
                disabled={isProcessing}
                className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 z-10"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="text-xs font-medium text-gray-500 mb-2 text-center">
                Frente
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previews[0]}
                alt="Vista previa frente"
                className="max-h-40 mx-auto rounded"
              />
              <p className="text-xs text-gray-600 text-center mt-2 truncate">{fileNames[0]}</p>
            </div>

            {/* Second photo or add button */}
            {previews.length === 2 ? (
              <div className="relative rounded-lg border border-gray-200 p-4">
                <button
                  type="button"
                  onClick={() => handleRemoveFile(1)}
                  disabled={isProcessing}
                  className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 z-10"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="text-xs font-medium text-gray-500 mb-2 text-center">
                  Reverso
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[1]}
                  alt="Vista previa reverso"
                  className="max-h-40 mx-auto rounded"
                />
                <p className="text-xs text-gray-600 text-center mt-2 truncate">{fileNames[1]}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClick}
                disabled={isProcessing}
                className="rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-gray-400 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">Agregar reverso</span>
              </button>
            )}
          </div>

          {/* Inline warning for single photo */}
          {showWarning && selectedFiles.length === 1 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-900 mb-1">
                    Solo ha subido 1 imagen del documento
                  </h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Para mejores resultados, se recomienda subir ambos lados (frente y reverso) del documento.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCancelWarning}
                      disabled={isProcessing}
                    >
                      Agregar reverso
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleProceedWithWarning}
                      disabled={isProcessing}
                    >
                      Continuar de todas formas
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Extract Data Button */}
          {!showWarning && (
            <Button
              type="button"
              onClick={handleExtract}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extrayendo datos...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Extraer datos del documento
                </>
              )}
            </Button>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Puede subir ambas fotos a la vez o una por una (frente y reverso del documento). Se recomienda incluir ambos lados para mejores resultados. Asegúrese de que estén bien iluminadas y sean legibles. Formatos: JPG, PNG. Tamaño máximo: {maxSizeMB}MB por imagen.
      </p>
    </div>
  );
}
