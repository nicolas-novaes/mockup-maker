import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useEditorStore } from '../store/useEditorStore';
import { validateScreenshot, validateImageDimensions } from '../lib/validation';
import type { Screenshot } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

export function Upload() {
  const navigate = useNavigate();
  const setScreenshot = useEditorStore((state) => state.setScreenshot);

  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrors([]);
    setIsLoading(true);

    try {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrors(['Only PNG and JPG images are supported']);
        setIsLoading(false);
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(['File size must be less than 10MB']);
        setIsLoading(false);
        return;
      }

      // Read and validate image
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        const img = new Image();

        img.onload = () => {
          // Validate dimensions
          const dimensionValidation = validateImageDimensions(img.width, img.height, {
            minWidth: 400,
            minHeight: 800,
          });

          if (!dimensionValidation.valid) {
            setErrors(dimensionValidation.errors);
            setIsLoading(false);
            return;
          }

          // Create screenshot object
          const screenshot: Screenshot = {
            id: uuidv4(),
            data,
            width: img.width,
            height: img.height,
            mimeType: file.type,
            uploadedAt: Date.now(),
          };

          // Validate screenshot
          const screenshotValidation = validateScreenshot(screenshot);
          if (!screenshotValidation.valid) {
            setErrors(screenshotValidation.errors);
            setIsLoading(false);
            return;
          }

          // Set preview and store
          setPreview(data);
          setScreenshot(screenshot);
          setIsLoading(false);

          // Navigate to editor
          navigate('/editor');
        };

        img.onerror = () => {
          setErrors(['Failed to load image']);
          setIsLoading(false);
        };

        img.src = data;
      };

      reader.onerror = () => {
        setErrors(['Failed to read file']);
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setErrors(['An unexpected error occurred']);
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mockup Animator</h1>
          <p className="text-slate-400">Upload a screenshot to get started</p>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-slate-400 rounded-lg p-8 mb-6 bg-slate-700 bg-opacity-50 hover:bg-opacity-75 transition-all cursor-pointer"
        >
          {preview ? (
            <div className="flex flex-col items-center">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md mb-4"
              />
              <p className="text-slate-300 text-sm text-center">
                Image selected. Ready to proceed.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-slate-600 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-slate-300 text-center mb-2">
                Drag and drop your screenshot here
              </p>
              <p className="text-slate-500 text-sm">or click to select a file</p>
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
        </div>

        {/* Hidden file input wrapper for label button */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mb-6"
        >
          <Button
            variant="outline"
            className="w-full"
            disabled={isLoading}
            asChild
          >
            <label className="cursor-pointer">
              {isLoading ? 'Loading...' : 'Select File'}
            </label>
          </Button>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm font-medium mb-2">Validation Error:</p>
            <ul className="text-red-300 text-sm space-y-1">
              {errors.map((error, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4 text-sm text-slate-400">
          <p className="font-medium text-slate-300 mb-2">Requirements:</p>
          <ul className="space-y-1">
            <li>• PNG or JPG format</li>
            <li>• Minimum 400x800px</li>
            <li>• Maximum 10MB file size</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
