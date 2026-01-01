import { Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface PDFUploaderProps {
    onUpload: (file: File, fileName: string, onProgress?: (progress: number) => void) => Promise<void>;
    isLoading?: boolean;
    compact?: boolean;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onUpload, isLoading = false, compact = false }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const validatePDF = (file: File): boolean => {
        if (!file.type.includes('pdf')) {
            setError('Lütfen PDF dosyası seçiniz');
            return false;
        }
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            setError('Dosya boyutu 50MB\'dan küçük olmalıdır');
            return false;
        }
        setError('');
        return true;
    };

    const handleFileSelect = async (file: File) => {
        if (!validatePDF(file)) return;

        setUploadProgress(0);
        const name = fileName || file.name.replace('.pdf', '');
        await onUpload(file, name, (progress) => setUploadProgress(progress));
        setFileName('');
        setUploadProgress(0);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    if (compact) {
        return (
            <div className="space-y-2">
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDragOver
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleInputChange}
                        className="hidden"
                        disabled={isLoading}
                    />
                    <Upload className="mx-auto text-gray-400" size={20} />
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">
                        Sürükle & Bırak veya Tıkla
                    </p>
                </div>
                {isLoading && uploadProgress > 0 && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Yükleniyor...</span>
                            <span>%{uploadProgress}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}
                {error && (
                    <p className="text-xs text-red-500">{error}</p>
                )}
            </div>
        );
    }

    return (
        <div className="w-full space-y-3">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragOver
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={isLoading}
                />
                <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    PDF dosyasını buraya sürükleyin veya tıklayın
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    (Maksimum 50MB)
                </p>
            </div>

            {/* PDF adı giriş alanı */}
            <input
                type="text"
                placeholder="PDF adı (opsiyonel)"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />

            {/* Hata mesajı */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <X size={16} className="text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                </div>
            )}

            {isLoading && (
                <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-blue-600 rounded-full"></div>
                            <span className="text-sm text-blue-600 dark:text-blue-400">Yükleniyor...</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">%{uploadProgress}</span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
