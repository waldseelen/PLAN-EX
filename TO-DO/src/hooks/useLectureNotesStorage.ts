import { LectureNote } from '@/types';
import { useCallback, useEffect, useState } from 'react';

// IndexedDB bağlantısını global olarak sakla (performans için)
let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

// IndexedDB kullanarak büyük PDF verilerini saklama
const openDB = (): Promise<IDBDatabase> => {
    // Eğer zaten açık bir bağlantı varsa, onu döndür
    if (dbInstance && dbInstance.transaction) {
        try {
            // Bağlantının hala aktif olduğunu kontrol et
            dbInstance.transaction(['lectureNotes'], 'readonly');
            return Promise.resolve(dbInstance);
        } catch {
            dbInstance = null;
        }
    }

    // If a connection opening is already in progress, wait for it
    if (dbPromise) {
        return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open('LectureNotesDB', 1);

        request.onerror = () => {
            dbPromise = null;
            reject(request.error);
        };

        request.onsuccess = () => {
            dbInstance = request.result;

            // Bağlantı kapandığında referansı temizle
            dbInstance.onclose = () => {
                dbInstance = null;
                dbPromise = null;
            };

            dbPromise = null;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('lectureNotes')) {
                db.createObjectStore('lectureNotes', { keyPath: 'courseId' });
            }
        };
    });

    return dbPromise;
};

const saveToIndexedDB = async (courseId: string, notes: LectureNote[]): Promise<void> => {
    try {
        const db = await openDB();
        const transaction = db.transaction(['lectureNotes'], 'readwrite');
        const store = transaction.objectStore('lectureNotes');

        await new Promise<void>((resolve, reject) => {
            const request = store.put({ courseId, notes });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        // db.close() kaldırıldı - bağlantı havuzlaması kullanılıyor
    } catch (error) {
        console.error('IndexedDB save error:', error);
        throw error;
    }
};

const loadFromIndexedDB = async (courseId: string): Promise<LectureNote[]> => {
    try {
        const db = await openDB();
        const transaction = db.transaction(['lectureNotes'], 'readonly');
        const store = transaction.objectStore('lectureNotes');

        const result = await new Promise<{ courseId: string; notes: LectureNote[] } | undefined>((resolve, reject) => {
            const request = store.get(courseId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        // db.close() kaldırıldı - bağlantı havuzlaması kullanılıyor
        return result?.notes || [];
    } catch (error) {
        console.error('IndexedDB read error:', error);
        return [];
    }
};

const deleteFromIndexedDB = async (courseId: string): Promise<void> => {
    try {
        const db = await openDB();
        const transaction = db.transaction(['lectureNotes'], 'readwrite');
        const store = transaction.objectStore('lectureNotes');

        await new Promise<void>((resolve, reject) => {
            const request = store.delete(courseId);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        // db.close() kaldırıldı - bağlantı havuzlaması kullanılıyor
    } catch (error) {
        console.error('IndexedDB delete error:', error);
    }
};

export const useLectureNotesStorage = (courseId: string) => {
    const [lectureNotes, setLectureNotes] = useState<LectureNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // İlk yüklemede IndexedDB'den oku
    useEffect(() => {
        const loadNotes = async () => {
            setIsLoading(true);
            try {
                const notes = await loadFromIndexedDB(courseId);
                setLectureNotes(notes);
                setError(null);
            } catch (err) {
                console.error('Ders notları yüklenemedi:', err);
                setError('Ders notları yüklenemedi');
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            loadNotes();
        }
    }, [courseId]);

    // Save notes
    const saveLectureNotes = useCallback(async (notes: LectureNote[]) => {
        try {
            await saveToIndexedDB(courseId, notes);
            setLectureNotes(notes);
            setError(null);
            return true;
        } catch (err) {
            console.error('Could not save lecture notes:', err);
            setError('Could not save lecture notes. Storage may be full.');
            return false;
        }
    }, [courseId]);

    // Add note
    const addNote = useCallback(async (note: LectureNote) => {
        const updatedNotes = [...lectureNotes, note];
        return await saveLectureNotes(updatedNotes);
    }, [lectureNotes, saveLectureNotes]);

    // Delete note
    const deleteNote = useCallback(async (noteId: string) => {
        const updatedNotes = lectureNotes.filter(n => n.id !== noteId);
        return await saveLectureNotes(updatedNotes);
    }, [lectureNotes, saveLectureNotes]);

    // Clear all notes
    const clearAllNotes = useCallback(async () => {
        await deleteFromIndexedDB(courseId);
        setLectureNotes([]);
    }, [courseId]);

    return {
        lectureNotes,
        isLoading,
        error,
        saveLectureNotes,
        addNote,
        deleteNote,
        clearAllNotes
    };
};

// Tüm kursların ders notlarını yükle (Overview için)
export const loadAllLectureNotes = async (): Promise<Map<string, LectureNote[]>> => {
    const notesMap = new Map<string, LectureNote[]>();

    try {
        const db = await openDB();
        const transaction = db.transaction(['lectureNotes'], 'readonly');
        const store = transaction.objectStore('lectureNotes');

        const allNotes = await new Promise<{ courseId: string; notes: LectureNote[] }[]>((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });

        for (const item of allNotes) {
            notesMap.set(item.courseId, item.notes);
        }

        // db.close() kaldırıldı - bağlantı havuzlaması kullanılıyor
    } catch (error) {
        console.error('Tüm ders notları yüklenemedi:', error);
    }

    return notesMap;
};
