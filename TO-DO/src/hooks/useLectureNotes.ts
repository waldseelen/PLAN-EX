import { LectureNote } from '@/types';
import { useCallback } from 'react';

export const useLectureNotes = () => {
    const convertFileToBase64 = useCallback((file: File, onProgress?: (progress: number) => void): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result as string;
                resolve(base64String.split(',')[1]); // Extract Base64 part
            };
            reader.onerror = () => reject(new Error('Could not read file'));
            reader.onprogress = (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    onProgress(progress);
                }
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const addLectureNote = useCallback(
        async (file: File, fileName: string, currentNotes: LectureNote[] = [], onProgress?: (progress: number) => void): Promise<LectureNote[]> => {
            try {
                const fileData = await convertFileToBase64(file, onProgress);
                const newNote: LectureNote = {
                    id: `note-${Date.now()}`,
                    name: fileName || file.name.replace('.pdf', ''),
                    fileName: file.name,
                    fileData,
                    uploadDate: new Date().toISOString(),
                };
                return [...currentNotes, newNote];
            } catch (error) {
                console.error('Error adding PDF:', error);
                throw new Error('An error occurred while adding PDF');
            }
        },
        [convertFileToBase64]
    );

    const deleteLectureNote = useCallback((noteId: string, currentNotes: LectureNote[]): LectureNote[] => {
        return currentNotes.filter(note => note.id !== noteId);
    }, []);

    return {
        addLectureNote,
        deleteLectureNote,
        convertFileToBase64,
    };
};
