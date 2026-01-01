import { Copy, Download, Keyboard, RotateCcw, Settings as SettingsIcon, Timer, Upload, Volume2, VolumeX, X } from 'lucide-react';

import { usePlannerContext } from '@/context/AppContext';
import { usePomodoroSettings } from '@/hooks/usePomodoroSettings';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExport: () => void;
    onExportToday: () => void;
}

export const SettingsModal = ({ isOpen, onClose, onImport, onExport, onExportToday }: Props) => {
    const { settings, updateSettings, resetSettings, DEFAULT_SETTINGS } = usePomodoroSettings();
    const { soundEnabled, setSoundEnabled } = usePlannerContext();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1625] p-6 rounded-2xl shadow-2xl max-w-md w-full border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <SettingsIcon className="text-slate-400" /> Settings
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Ses Ayarları */}
                    <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {soundEnabled ? (
                                    <Volume2 size={18} className="text-amber-400" />
                                ) : (
                                    <VolumeX size={18} className="text-amber-400/50" />
                                )}
                                <div>
                                    <h4 className="font-bold text-amber-400">Completion Sound</h4>
                                    <p className="text-xs text-amber-400/70">Play sound when task is completed</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-amber-500' : 'bg-slate-600'}`}
                            >
                                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform shadow-sm ${soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Pomodoro Ayarları */}
                    <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-rose-400 flex items-center gap-2">
                                <Timer size={16} /> Pomodoro Settings
                            </h4>
                            <button
                                onClick={resetSettings}
                                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                                title="Reset to Default"
                            >
                                <RotateCcw size={12} /> Reset
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] text-rose-400/70 font-bold uppercase mb-1">
                                    Work (min)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    value={settings.workDuration}
                                    onChange={(e) => updateSettings({ workDuration: Math.max(1, parseInt(e.target.value) || DEFAULT_SETTINGS.workDuration) })}
                                    className="w-full p-2 bg-[#2a2438] border border-rose-500/30 rounded-lg text-sm text-center font-mono text-white focus:outline-none focus:border-rose-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-rose-400/70 font-bold uppercase mb-1">
                                    Short Break (min)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={settings.shortBreakDuration}
                                    onChange={(e) => updateSettings({ shortBreakDuration: Math.max(1, parseInt(e.target.value) || DEFAULT_SETTINGS.shortBreakDuration) })}
                                    className="w-full p-2 bg-[#2a2438] border border-rose-500/30 rounded-lg text-sm text-center font-mono text-white focus:outline-none focus:border-rose-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-rose-400/70 font-bold uppercase mb-1">
                                    Long Break (min)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={settings.longBreakDuration}
                                    onChange={(e) => updateSettings({ longBreakDuration: Math.max(1, parseInt(e.target.value) || DEFAULT_SETTINGS.longBreakDuration) })}
                                    className="w-full p-2 bg-[#2a2438] border border-rose-500/30 rounded-lg text-sm text-center font-mono text-white focus:outline-none focus:border-rose-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-rose-400/70 font-bold uppercase mb-1">
                                    Long Break Interval
                                </label>
                                <input
                                    type="number"
                                    min="2"
                                    max="10"
                                    value={settings.sessionsBeforeLongBreak}
                                    onChange={(e) => updateSettings({ sessionsBeforeLongBreak: Math.max(2, parseInt(e.target.value) || DEFAULT_SETTINGS.sessionsBeforeLongBreak) })}
                                    className="w-full p-2 bg-[#2a2438] border border-rose-500/30 rounded-lg text-sm text-center font-mono text-white focus:outline-none focus:border-rose-500/50"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-rose-400/60 mt-2 text-center">
                            Every {settings.sessionsBeforeLongBreak} pomodoros, take a {settings.longBreakDuration} min long break
                        </p>
                    </div>

                    <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <h4 className="font-bold text-blue-400 mb-1">Backup Data</h4>
                        <p className="text-xs text-blue-400/70 mb-3">Download all your progress as a JSON file.</p>
                        <button
                            onClick={onExport}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Download size={16} /> Download Backup
                        </button>
                    </div>

                    <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <h4 className="font-bold text-emerald-400 mb-1">Markdown Export</h4>
                        <p className="text-xs text-emerald-400/70 mb-3">Copy today's completed tasks for Obsidian/Notion.</p>
                        <button
                            onClick={onExportToday}
                            className="w-full py-2 bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                            <Copy size={16} /> Copy to Clipboard
                        </button>
                    </div>

                    <div className="p-4 bg-[#2a2438] rounded-xl border border-white/10">
                        <h4 className="font-bold text-slate-300 mb-1">Load Backup</h4>
                        <p className="text-xs text-slate-400 mb-3">Restore a previously downloaded backup.</p>
                        <label className="w-full py-2 bg-[#352f42] border border-white/10 text-slate-300 rounded-lg flex items-center justify-center gap-2 text-sm font-medium cursor-pointer hover:bg-[#3d3548] transition-colors">
                            <Upload size={16} />
                            Select File
                            <input type="file" accept=".json" onChange={onImport} className="hidden" />
                        </label>
                    </div>

                    {/* Klavye Kısayolları */}
                    <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <h4 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                            <Keyboard size={16} /> Keyboard Shortcuts
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Save</span>
                                <kbd className="px-1.5 py-0.5 bg-[#2a2438] rounded text-purple-400 font-mono">Ctrl+S</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Undo</span>
                                <kbd className="px-1.5 py-0.5 bg-[#2a2438] rounded text-purple-400 font-mono">Ctrl+Z</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Search</span>
                                <kbd className="px-1.5 py-0.5 bg-[#2a2438] rounded text-purple-400 font-mono">Ctrl+K</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">New Task</span>
                                <kbd className="px-1.5 py-0.5 bg-[#2a2438] rounded text-purple-400 font-mono">Ctrl+N</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Theme</span>
                                <kbd className="px-1.5 py-0.5 bg-[#2a2438] rounded text-purple-400 font-mono">Ctrl+Shift+D</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Settings</span>
                                <kbd className="px-1.5 py-0.5 bg-[#2a2438] rounded text-purple-400 font-mono">Ctrl+,</kbd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
