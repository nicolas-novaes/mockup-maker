import { useRef, useState, useEffect, useCallback } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { validateScreenshot } from '../lib/validation';
import type { Screenshot } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';
import { Upload, AlertCircle, X, Link, Key, LogOut, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import {
  parseFigmaUrl,
  fetchFigmaScreenshot,
  loadImageAsDataURL,
  getFigmaToken,
  saveFigmaToken,
  clearFigmaToken,
} from '../lib/figma';

export function ImageUploadPanel() {
  const setScreenshot = useEditorStore((state) => state.setScreenshot);
  const screenshot = useEditorStore((state) => state.screenshot);
  const clearScreenshot = useEditorStore((state) => state.clearScreenshot);

  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Figma state
  const [figmaUrl, setFigmaUrl] = useState('');
  const [figmaToken, setFigmaToken] = useState(getFigmaToken() || '');
  const [showTokenInput, setShowTokenInput] = useState(!getFigmaToken());

  const handleFile = async (file: File) => {
    setErrors([]);
    setIsLoading(true);

    try {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrors(['Apenas PNG e JPG são suportados']);
        setIsLoading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        const img = new Image();

        img.onload = () => {
          const screenshotObj: Screenshot = {
            id: uuidv4(),
            data,
            width: img.width,
            height: img.height,
            mimeType: file.type,
            uploadedAt: Date.now(),
          };

          const validation = validateScreenshot(screenshotObj);
          if (!validation.valid) {
            setErrors(validation.errors);
            setIsLoading(false);
            return;
          }

          setPreview(data);
          setScreenshot(screenshotObj);
          setIsLoading(false);
        };

        img.onerror = () => {
          setErrors(['Falha ao carregar a imagem']);
          setIsLoading(false);
        };

        img.src = data;
      };

      reader.onerror = () => {
        setErrors(['Falha ao ler o arquivo']);
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    } catch {
      setErrors(['Erro inesperado']);
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    clearScreenshot();
    setPreview(null);
  };

  // Figma handlers
  const handleSaveToken = () => {
    if (!figmaToken.trim()) return;
    saveFigmaToken(figmaToken.trim());
    setShowTokenInput(false);
    setErrors([]);
  };

  const handleDisconnectFigma = () => {
    clearFigmaToken();
    setFigmaToken('');
    setShowTokenInput(true);
  };

  const importFromFigma = useCallback(async (url: string) => {
    setErrors([]);

    const parsed = parseFigmaUrl(url);
    if (!parsed) return; // Silently ignore invalid URLs while typing

    const token = getFigmaToken();
    if (!token) {
      setShowTokenInput(true);
      setErrors(['Configure seu token do Figma primeiro.']);
      return;
    }

    setIsLoading(true);

    try {
      const imageUrl = await fetchFigmaScreenshot(parsed.fileKey, parsed.nodeId, token);
      const { dataURL, width, height } = await loadImageAsDataURL(imageUrl);

      const screenshotObj: Screenshot = {
        id: uuidv4(),
        data: dataURL,
        width,
        height,
        mimeType: 'image/png',
        uploadedAt: Date.now(),
      };

      const validation = validateScreenshot(screenshotObj);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }

      setScreenshot(screenshotObj);
    } catch (err) {
      setErrors([(err as Error).message]);
    } finally {
      setIsLoading(false);
    }
  }, [setScreenshot]);

  // Auto-import when Figma URL changes (debounced)
  useEffect(() => {
    if (!figmaUrl.trim() || activeTab !== 'figma') return;
    if (!parseFigmaUrl(figmaUrl)) return;

    const timeout = setTimeout(() => {
      importFromFigma(figmaUrl);
    }, 500);

    return () => clearTimeout(timeout);
  }, [figmaUrl, activeTab, importFromFigma]);

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        Screenshot
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setErrors([]); }}>
        <TabsList className="w-full bg-gray-900 border border-gray-800">
          <TabsTrigger value="upload" className="flex-1 gap-1.5 text-xs data-[state=active]:bg-gray-800 data-[state=active]:text-gray-100">
            <Upload className="w-3.5 h-3.5" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="figma" className="flex-1 gap-1.5 text-xs data-[state=active]:bg-gray-800 data-[state=active]:text-gray-100">
            <Link className="w-3.5 h-3.5" />
            Figma
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          {(screenshot || preview) ? (
            <div className="relative overflow-hidden rounded-lg border border-gray-700 bg-gray-900 aspect-video">
              <img
                src={preview || screenshot?.data}
                alt="Screenshot preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end justify-center p-4 gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleChangeImage}
                  disabled={isLoading}
                  className="text-xs bg-gray-900/80 border-gray-600"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Trocar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClear}
                  disabled={isLoading}
                  className="text-xs text-red-400 hover:text-red-300 bg-gray-900/80 border-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-lg border-2 border-dashed transition-all duration-200 p-8 text-center cursor-pointer ${
                isDragActive
                  ? 'border-gray-500 bg-gray-800/40'
                  : 'border-gray-700 bg-gray-800/20 hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                {isLoading ? (
                  <>
                    <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-gray-300 animate-spin" />
                    <p className="text-xs font-medium text-gray-400">Processando...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs font-semibold text-gray-300">
                        Arraste sua captura
                      </p>
                      <p className="text-xs text-gray-500">
                        ou clique para selecionar
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileInputChange}
            disabled={isLoading}
            className="hidden"
          />
        </TabsContent>

        <TabsContent value="figma" className="mt-3">
          <div className="space-y-3">
            {showTokenInput ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Key className="w-3 h-3" />
                  <span>Personal Access Token</span>
                </div>
                <Input
                  type="password"
                  value={figmaToken}
                  onChange={(e) => setFigmaToken(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveToken()}
                  placeholder="figd_xxxxxxxxxx..."
                  className="h-8 text-xs bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-600"
                />
                <div className="flex items-center justify-between">
                  <a
                    href="https://www.figma.com/developers/api#access-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-gray-500 hover:text-gray-400 underline"
                  >
                    Como gerar um token?
                  </a>
                  <Button
                    size="sm"
                    onClick={handleSaveToken}
                    disabled={!figmaToken.trim()}
                    className="text-xs h-7"
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-2 py-1.5 bg-gray-800/50 rounded-md border border-gray-800">
                <span className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Conectado ao Figma
                </span>
                <button
                  onClick={handleDisconnectFigma}
                  className="text-[10px] text-gray-500 hover:text-gray-300 flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  Desconectar
                </button>
              </div>
            )}

            {!showTokenInput && (
              <div className="relative">
                <Input
                  type="text"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  placeholder="Cole o link do Figma (com node selecionado)"
                  className="h-8 text-xs bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-600 pr-8"
                />
                {isLoading && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                  </span>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="flex gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div className="text-xs text-red-400 space-y-1">
            {errors.map((error, idx) => (
              <p key={idx}>{error}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
