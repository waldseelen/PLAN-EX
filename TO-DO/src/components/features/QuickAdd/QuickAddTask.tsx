/**
 * Quick Add Task Component
 * Global task adding shortcut (opens with Ctrl+N)
 */

import { ChevronDown, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { usePlannerContext } from '@/context/AppContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const QuickAddTask = ({ isOpen, onClose }: Props) => {
    const { courses, addTaskToCourse, createNewCourse } = usePlannerContext();
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [taskText, setTaskText] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Modal açıldığında input'a focus
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            // İlk dersi seç
            if (!selectedCourseId && courses.length > 0) {
                setSelectedCourseId(courses[0].id);
            }
        }
    }, [isOpen, courses, selectedCourseId]);

    // Escape tuşu ile kapat
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleSubmit = () => {
        if (!taskText.trim() || !selectedCourseId) return;

        addTaskToCourse(selectedCourseId, taskText.trim());

        // Toast göster
        const event = new CustomEvent('toast', {
            detail: { message: 'Task added!', type: 'success' }
        });
        window.dispatchEvent(event);

        // Formu temizle ve kapat
        setTaskText('');
        onClose();
    };

    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center md:items-start justify-center md:pt-[15vh] bg-black/70 backdrop-blur-sm animate-fade-in p-4 md:p-0">
            <div className="bg-[#1a1625] w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <h3 className="font-bold flex items-center gap-2">
                        <Plus size={20} />
                        Quick Add Task
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    {/* Course Selector */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Select Course
                        </label>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="w-full p-3 bg-[#2a2438] border border-white/10 rounded-xl text-left flex items-center justify-between hover:border-purple-500/30 transition-all"
                        >
                            {selectedCourse ? (
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${selectedCourse.color}`}></div>
                                    <span className="text-white">{selectedCourse.title}</span>
                                </div>
                            ) : (
                                <span className="text-slate-500">Select a course...</span>
                            )}
                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-[#2a2438] border border-white/10 rounded-xl shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
                                {/* Create New Course Option */}
                                <button
                                    onClick={() => {
                                        const newCourse = createNewCourse();
                                        setSelectedCourseId(newCourse.id);
                                        setShowDropdown(false);
                                        const event = new CustomEvent('toast', {
                                            detail: { message: 'New course created!', type: 'success' }
                                        });
                                        window.dispatchEvent(event);
                                    }}
                                    className="w-full p-3 flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-colors border-b border-white/10 sticky top-0 backdrop-blur-sm"
                                >
                                    <Plus size={16} className="text-purple-400" />
                                    <span className="text-white font-semibold">Create New Course</span>
                                </button>

                                {/* Existing Courses */}
                                {courses.map(course => (
                                    <button
                                        key={course.id}
                                        onClick={() => {
                                            setSelectedCourseId(course.id);
                                            setShowDropdown(false);
                                        }}
                                        className="w-full p-3 flex items-center gap-2 hover:bg-purple-500/10 transition-colors last:rounded-b-xl"
                                    >
                                        <div className={`w-3 h-3 rounded-full ${course.color}`}></div>
                                        <span className="text-white">{course.title}</span>
                                        <span className="text-xs text-slate-500 ml-auto">{course.code}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Task Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Task
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={taskText}
                            onChange={e => setTaskText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            placeholder="Task description..."
                            className="w-full p-3 bg-[#2a2438] border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-slate-500 transition-all"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={!taskText.trim() || !selectedCourseId}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                    >
                        Add Task
                    </button>

                    {/* Shortcut hint */}
                    <p className="text-center text-xs text-slate-500">
                        <kbd className="px-1.5 py-0.5 bg-[#2a2438] rounded text-xs text-purple-400">Enter</kbd>
                        {' '}to add • {' '}
                        <kbd className="px-1.5 py-0.5 bg-[#2a2438] rounded text-xs text-purple-400">Esc</kbd>
                        {' '}to close
                    </p>
                </div>
            </div>
        </div>
    );
};
