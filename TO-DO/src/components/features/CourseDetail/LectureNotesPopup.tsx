import { useLectureNotes } from '@/hooks/useLectureNotes';
import { LectureNote } from '@/types';
import { ChevronDown, Download, ExternalLink, FileText, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { PDFUploader } from './PDFUploader';
import { downloadPDF, openPDFInNewTab } from './PDFViewer';

interface LectureNotesPopupProps {
    isOpen: boolean;
    onClose: () => void;
    lectureNotes: LectureNote[];
    onUpdate: (notes: LectureNote[]) => void;
    courseColor?: string;
}

export const LectureNotesPopup: React.FC<LectureNotesPopupProps> = ({
    isOpen,
    onClose,
    lectureNotes,
    onUpdate,
    courseColor
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const { addLectureNote, deleteLectureNote } = useLectureNotes();

    const handleUpload = async (file: File, fileName: string, onProgress?: (progress: number) => void) => {
        setIsUploading(true);
        try {
            const updatedNotes = await addLectureNote(file, fileName, lectureNotes, onProgress);
            onUpdate(updatedNotes);
        } catch (error) {
            console.error('Yükleme hatası:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = (noteId: string) => {
        if (confirm('Bu PDF\'i silmek istediğinize emin misiniz?')) {
            const updatedNotes = deleteLectureNote(noteId, lectureNotes);
            onUpdate(updatedNotes);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Popup */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-fade-in">
                {/* Header */}
                <div
                    className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    style={{ backgroundColor: courseColor ? `${courseColor}20` : undefined }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: courseColor || '#6366f1' }}
                        >
                            <FileText size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Ders Notları & PDF</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {lectureNotes.length} dosya yüklü
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Upload Area */}
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            PDF Yükle
                        </h4>
                        <PDFUploader onUpload={handleUpload} isLoading={isUploading} compact />
                    </div>

                    {/* PDF List */}
                    {lectureNotes.length > 0 ? (
                        <div>
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                Yüklü Dosyalar
                            </h4>
                            <div className="space-y-2">
                                {lectureNotes.map(note => (
                                    <div
                                        key={note.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FileText size={18} style={{ color: courseColor || '#6366f1' }} />
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                                    {note.name}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(note.uploadDate).toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openPDFInNewTab(note)}
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                                                style={{
                                                    backgroundColor: courseColor || '#6366f1',
                                                    color: 'white'
                                                }}
                                                title="Yeni sekmede aç"
                                            >
                                                <ExternalLink size={12} />
                                                Aç
                                            </button>
                                            <button
                                                onClick={() => downloadPDF(note)}
                                                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                title="İndir"
                                            >
                                                <Download size={14} className="text-slate-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(note.id)}
                                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Sil"
                                            >
                                                <Trash2 size={14} className="text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Henüz PDF eklenmemiş
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// Son yüklenen PDF butonu - direkt yeni sekmede açar
interface LastPDFButtonProps {
    lectureNote: LectureNote | null;
    onClick: () => void;
    courseColor?: string;
}

export const LastPDFButton: React.FC<LastPDFButtonProps> = ({ lectureNote }) => {
    if (!lectureNote) return null;

    return (
        <button
            onClick={() => openPDFInNewTab(lectureNote)}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm hover:scale-105 max-w-[150px]"
            title={`Aç: ${lectureNote.name}`}
        >
            <FileText size={14} />
            <span className="truncate">{lectureNote.name}</span>
        </button>
    );
};

// PDF yönetim butonu
interface PDFManagerButtonProps {
    onClick: () => void;
    noteCount: number;
}

export const PDFManagerButton: React.FC<PDFManagerButtonProps> = ({ onClick, noteCount }) => {
    return (
        <button
            onClick={onClick}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm hover:scale-105"
            title="Ders Notları"
        >
            <FileText size={14} />
            <span>PDF</span>
            {noteCount > 0 && (
                <span className="bg-white/30 px-1.5 py-0.5 rounded-md text-[10px]">{noteCount}</span>
            )}
            <ChevronDown size={12} />
        </button>
    );
};
