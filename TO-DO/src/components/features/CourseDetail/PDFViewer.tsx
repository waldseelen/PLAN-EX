import { LectureNote } from '@/types';

// Base64'ten Blob URL oluştur ve yeni sekmede aç
export const openPDFInNewTab = (lectureNote: LectureNote): void => {
    try {
        const byteCharacters = atob(lectureNote.fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        // Yeni sekmede aç
        const newWindow = window.open(blobUrl, '_blank');

        // Popup blocker durumunda fallback
        if (!newWindow) {
            const link = document.createElement('a');
            link.href = blobUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Clean up blob URL after 1 minute (new tab will have loaded)
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 60000);
    } catch (error) {
        console.error('PDF açma hatası:', error);
        alert('PDF açılırken bir hata oluştu');
    }
};

// PDF indirme fonksiyonu
export const downloadPDF = (lectureNote: LectureNote): void => {
    try {
        const byteCharacters = atob(lectureNote.fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${lectureNote.name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('PDF indirme hatası:', error);
        alert('PDF indirilirken bir hata oluştu');
    }
};
