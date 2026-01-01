/**
 * LectureNotes Component
 *
 * Ders notları (PDF) yükleme, listeleme ve yönetimi.
 *
 * Özellikler:
 * - PDF yükleme (drag & drop + file picker)
 * - Upload progress bar
 * - Dosya listesi
 * - Yeni sekmede açma
 * - İndirme
 * - Silme
 */

import { Download, ExternalLink, FileText, Trash2, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
    deletePDF,
    downloadPDF,
    getCoursePDFs,
    openPDFInNewTab,
    uploadPDF,
    type PDFBlob,
    type UploadProgress
} from '../../lib/pdfStorage'
import { cn, formatFileSize } from '../../lib/utils'
import { IconButton } from '../ui/Button'
import { Card, EmptyState } from '../ui/Card'

interface LectureNotesProps {
    courseId: string
    courseName: string
}

export function LectureNotes({ courseId, courseName }: LectureNotesProps) {
    const [pdfs, setPdfs] = useState<PDFBlob[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    // Load PDFs on mount
    const loadPDFs = useCallback(async () => {
        try {
            setIsLoading(true)
            const coursePDFs = await getCoursePDFs(courseId)
            // Sort by upload date (newest first)
            coursePDFs.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
            setPdfs(coursePDFs)
        } catch (err) {
            console.error('Failed to load PDFs:', err)
            setError('PDF\'ler yüklenemedi')
        } finally {
            setIsLoading(false)
        }
    }, [courseId])

    useEffect(() => {
        loadPDFs()
    }, [loadPDFs])

    // Handle file upload
    const handleUpload = async (file: File) => {
        setError(null)
        setIsUploading(true)
        setUploadProgress({ loaded: 0, total: file.size, percentage: 0 })

        try {
            await uploadPDF(file, courseId, setUploadProgress)
            await loadPDFs()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Yükleme başarısız')
        } finally {
            setIsUploading(false)
            setUploadProgress(null)
        }
    }

    // File input change handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleUpload(file)
        }
        // Reset input
        e.target.value = ''
    }

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const file = e.dataTransfer.files[0]
        if (file && file.type === 'application/pdf') {
            handleUpload(file)
        } else {
            setError('Sadece PDF dosyaları yüklenebilir')
        }
    }

    // Delete handler
    const handleDelete = async (id: string) => {
        try {
            await deletePDF(id)
            setPdfs(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            setError('Silme başarısız')
        }
    }

    // Open in new tab
    const handleOpen = async (id: string) => {
        try {
            await openPDFInNewTab(id)
        } catch (err) {
            setError('Dosya açılamadı')
        }
    }

    // Download
    const handleDownload = async (id: string) => {
        try {
            await downloadPDF(id)
        } catch (err) {
            setError('İndirme başarısız')
        }
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-primary">Ders Notları</h2>
                <label className="cursor-pointer">
                    <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isUploading}
                    />
                    <span
                        className={cn(
                            'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
                            'px-3 py-1.5 text-sm',
                            'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm',
                            isUploading && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <Upload className="w-4 h-4" />
                        PDF Yükle
                    </span>
                </label>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                    <p className="text-sm text-red-400">{error}</p>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Upload progress */}
            {isUploading && uploadProgress && (
                <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-blue-400">Yükleniyor...</p>
                        <p className="text-sm text-blue-400">{uploadProgress.percentage}%</p>
                    </div>
                    <div className="h-2 bg-blue-500/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-200"
                            style={{ width: `${uploadProgress.percentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Drag & drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'border-2 border-dashed rounded-xl p-6 transition-colors mb-4',
                    isDragOver
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 hover:border-white/20'
                )}
            >
                <div className="text-center">
                    <FileText className="w-10 h-10 text-tertiary mx-auto mb-2" />
                    <p className="text-sm text-secondary">
                        PDF dosyasını buraya sürükleyin veya
                    </p>
                    <label className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                        dosya seçin
                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isUploading}
                        />
                    </label>
                    <p className="text-xs text-tertiary mt-2">Maksimum 50MB</p>
                </div>
            </div>

            {/* PDF List */}
            {isLoading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto"></div>
                    <p className="text-sm text-secondary mt-2">Yükleniyor...</p>
                </div>
            ) : pdfs.length === 0 ? (
                <EmptyState
                    icon={<FileText className="w-8 h-8 text-tertiary" />}
                    title="Henüz ders notu yok"
                    description={`${courseName} için PDF ders notları ekleyin`}
                />
            ) : (
                <div className="space-y-2">
                    {pdfs.map((pdf) => (
                        <div
                            key={pdf.id}
                            className={cn(
                                'p-3 rounded-xl border flex items-center gap-3',
                                'border-default bg-secondary/20 hover:bg-secondary/30 transition-colors group'
                            )}
                        >
                            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-red-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <button
                                    onClick={() => handleOpen(pdf.id)}
                                    className="font-medium text-primary hover:text-blue-400 transition-colors truncate block text-left w-full"
                                    title={pdf.fileName}
                                >
                                    {pdf.fileName}
                                </button>
                                <p className="text-xs text-secondary">
                                    {formatFileSize(pdf.blob.size)} • {new Date(pdf.uploadedAt).toLocaleDateString('tr-TR')}
                                </p>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <IconButton
                                    size="sm"
                                    onClick={() => handleOpen(pdf.id)}
                                    title="Yeni sekmede aç"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </IconButton>
                                <IconButton
                                    size="sm"
                                    onClick={() => handleDownload(pdf.id)}
                                    title="İndir"
                                >
                                    <Download className="w-4 h-4" />
                                </IconButton>
                                <IconButton
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleDelete(pdf.id)}
                                    title="Sil"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </IconButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}
