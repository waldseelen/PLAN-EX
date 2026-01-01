/**
 * Backup Reminder Banner
 * Shows backup reminder to the user.
 *
 * @author Code Audit - Production Ready
 * @version 1.0.0
 */

import { AlertTriangle, CloudUpload, X } from 'lucide-react';

interface Props {
    daysSinceBackup: number;
    formattedLastBackup: string;
    onBackup: () => void;
    onDismiss: () => void;
}

export const BackupReminderBanner = ({
    daysSinceBackup,
    formattedLastBackup,
    onBackup,
    onDismiss
}: Props) => {
    const isUrgent = daysSinceBackup >= 14;

    return (
        <div
            className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 rounded-2xl shadow-2xl border overflow-hidden animate-slide-in-right ${isUrgent
                ? 'bg-gradient-to-r from-red-500 to-orange-500 border-red-400'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 border-amber-400'
                }`}
        >
            <div className="p-4 text-white">
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isUrgent ? 'bg-red-600/50' : 'bg-amber-600/50'}`}>
                        <AlertTriangle size={24} />
                    </div>

                    <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">
                            {isUrgent ? '⚠️ Urgent Backup!' : '💾 Backup Reminder'}
                        </h4>
                        <p className="text-sm opacity-90 mb-3">
                            {daysSinceBackup === Infinity
                                ? 'You haven\'t backed up yet!'
                                : `Last backup: ${formattedLastBackup} (${daysSinceBackup} days ago)`
                            }
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={onBackup}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-amber-700 rounded-lg font-bold text-sm hover:bg-amber-50 transition-colors shadow-md"
                            >
                                <CloudUpload size={16} />
                                Backup Now
                            </button>
                            <button
                                onClick={onDismiss}
                                className="px-3 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
                            >
                                Later
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onDismiss}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
