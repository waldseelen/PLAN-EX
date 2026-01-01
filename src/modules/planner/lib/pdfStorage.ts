/**
 * PDF Storage Service
 *
 * IndexedDB kullanarak PDF dosyalarını saklar.
 * Large blob'lar için ayrı bir tablo kullanılır.
 *
 * Özellikler:
 * - PDF dosyalarını IndexedDB'de sakla (max 50MB)
 * - Upload progress tracking
 * - Dosya indirme ve yeni sekmede açma
 * - Otomatik cleanup (orphan blob'lar)
 */

import Dexie, { type EntityTable } from 'dexie'

// ================== TYPES ==================

export interface PDFBlob {
    id: string
    courseId: string
    fileName: string
    mimeType: string
    blob: Blob
    uploadedAt: string
}

// ================== DATABASE ==================

class PDFStorageDB extends Dexie {
    pdfBlobs!: EntityTable<PDFBlob, 'id'>

    constructor() {
        super('planex-pdf-storage')

        this.version(1).stores({
            pdfBlobs: 'id, courseId, fileName, uploadedAt',
        })
    }
}

const pdfDB = new PDFStorageDB()

// ================== CONSTANTS ==================

const MAX_PDF_SIZE_MB = 50
const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024

// ================== SERVICE ==================

export interface UploadProgress {
    loaded: number
    total: number
    percentage: number
}

export type UploadProgressCallback = (progress: UploadProgress) => void

/**
 * PDF dosyasını IndexedDB'ye yükle
 */
export async function uploadPDF(
    file: File,
    courseId: string,
    onProgress?: UploadProgressCallback
): Promise<{ id: string; fileName: string; fileSize: number }> {
    // Validate file type
    if (file.type !== 'application/pdf') {
        throw new Error('Sadece PDF dosyaları yüklenebilir')
    }

    // Validate file size
    if (file.size > MAX_PDF_SIZE_BYTES) {
        throw new Error(`Dosya boyutu ${MAX_PDF_SIZE_MB}MB'ı aşamaz`)
    }

    // Simulate progress for better UX
    const simulateProgress = () => {
        if (!onProgress) return

        let loaded = 0
        const total = file.size
        const interval = setInterval(() => {
            loaded += total * 0.1
            if (loaded >= total * 0.9) {
                clearInterval(interval)
            }
            onProgress({
                loaded: Math.min(loaded, total * 0.9),
                total,
                percentage: Math.min(Math.round((loaded / total) * 100), 90),
            })
        }, 50)

        return () => clearInterval(interval)
    }

    const stopProgress = simulateProgress()

    try {
        // Read file as blob
        const blob = new Blob([await file.arrayBuffer()], { type: file.type })

        const id = `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

        const pdfBlob: PDFBlob = {
            id,
            courseId,
            fileName: file.name,
            mimeType: file.type,
            blob,
            uploadedAt: new Date().toISOString(),
        }

        await pdfDB.pdfBlobs.add(pdfBlob)

        // Complete progress
        if (onProgress) {
            onProgress({
                loaded: file.size,
                total: file.size,
                percentage: 100,
            })
        }

        return {
            id,
            fileName: file.name,
            fileSize: file.size,
        }
    } finally {
        stopProgress?.()
    }
}

/**
 * PDF blob'unu ID ile getir
 */
export async function getPDFBlob(id: string): Promise<PDFBlob | undefined> {
    return pdfDB.pdfBlobs.get(id)
}

/**
 * Bir derse ait tüm PDF'leri getir
 */
export async function getCoursePDFs(courseId: string): Promise<PDFBlob[]> {
    return pdfDB.pdfBlobs.where('courseId').equals(courseId).toArray()
}

/**
 * PDF'i yeni sekmede aç
 */
export async function openPDFInNewTab(id: string): Promise<void> {
    const pdf = await getPDFBlob(id)
    if (!pdf) {
        throw new Error('PDF bulunamadı')
    }

    const url = URL.createObjectURL(pdf.blob)
    window.open(url, '_blank')

    // Clean up URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 60000)
}

/**
 * PDF'i indir
 */
export async function downloadPDF(id: string): Promise<void> {
    const pdf = await getPDFBlob(id)
    if (!pdf) {
        throw new Error('PDF bulunamadı')
    }

    const url = URL.createObjectURL(pdf.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = pdf.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up URL
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * PDF'i sil
 */
export async function deletePDF(id: string): Promise<void> {
    await pdfDB.pdfBlobs.delete(id)
}

/**
 * Bir derse ait tüm PDF'leri sil
 */
export async function deleteCoursePDFs(courseId: string): Promise<void> {
    await pdfDB.pdfBlobs.where('courseId').equals(courseId).delete()
}

/**
 * Toplam kullanılan depolama alanını hesapla (bytes)
 */
export async function getTotalStorageUsed(): Promise<number> {
    const allPDFs = await pdfDB.pdfBlobs.toArray()
    return allPDFs.reduce((total, pdf) => total + pdf.blob.size, 0)
}

/**
 * Son yüklenen PDF'i getir (bir ders için)
 */
export async function getLastUploadedPDF(courseId: string): Promise<PDFBlob | undefined> {
    const pdfs = await pdfDB.pdfBlobs
        .where('courseId')
        .equals(courseId)
        .reverse()
        .sortBy('uploadedAt')

    return pdfs[0]
}

/**
 * Orphan PDF'leri temizle (silinmiş derslere ait)
 */
export async function cleanupOrphanPDFs(activeCourseIds: string[]): Promise<number> {
    const allPDFs = await pdfDB.pdfBlobs.toArray()
    const orphanIds = allPDFs
        .filter(pdf => !activeCourseIds.includes(pdf.courseId))
        .map(pdf => pdf.id)

    if (orphanIds.length > 0) {
        await pdfDB.pdfBlobs.bulkDelete(orphanIds)
    }

    return orphanIds.length
}

export { pdfDB }
