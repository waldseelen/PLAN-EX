import {
    BookOpen,
    Bot,
    Calendar,
    Check,
    CheckCircle,
    ChevronDown,
    Clock as ClockIcon,
    Copy,
    Globe,
    GripVertical,
    LayoutDashboard,
    List,
    Loader2,
    MoreVertical,
    Palette,
    Plus,
    Save,
    Trash2,
    Youtube
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { KanbanBoard } from '@/components/kanban/Board';
import { Checkmark } from '@/components/ui/Checkmark';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { usePlannerContext } from '@/context/AppContext';
import { useLectureNotesStorage } from '@/hooks/useLectureNotesStorage';
import { Task, Unit } from '@/types';
import { getCourseProgress } from '@/utils/course';
import { generateMarkdown } from '@/utils/markdown';
import { LastPDFButton, LectureNotesPopup, PDFManagerButton } from './LectureNotesPopup';

// Color presets
const COLOR_PRESETS = [
    { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500', gradient: 'from-blue-500 to-cyan-400' },
    { name: 'Purple', hex: '#6366f1', bg: 'bg-indigo-500', gradient: 'from-indigo-500 to-purple-500' },
    { name: 'Green', hex: '#10b981', bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Orange', hex: '#f97316', bg: 'bg-orange-500', gradient: 'from-orange-500 to-amber-500' },
    { name: 'Red', hex: '#ef4444', bg: 'bg-red-500', gradient: 'from-red-500 to-pink-600' },
    { name: 'Pink', hex: '#ec4899', bg: 'bg-pink-500', gradient: 'from-pink-500 to-rose-500' },
    { name: 'Yellow', hex: '#eab308', bg: 'bg-yellow-500', gradient: 'from-yellow-500 to-amber-400' },
    { name: 'Cyan', hex: '#06b6d4', bg: 'bg-cyan-500', gradient: 'from-cyan-500 to-blue-400' },
    { name: 'Gray', hex: '#475569', bg: 'bg-slate-600', gradient: 'from-slate-600 to-slate-800' },
];

interface Props {
    courseId: string;
    onOpenTaskDetails: (task: Task) => void;
}

export const CourseDetail = ({ courseId, onOpenTaskDetails }: Props) => {
    const {
        courses,
        completedTasks,
        toggleTask,
        updateCourse,
        updateCourseMeta,
        addTaskToCourse,
        deleteCourse,
        updateTaskStatus
    } = usePlannerContext();
    const course = courses.find(c => c.id === courseId);

    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [openUnits, setOpenUnits] = useState<Set<number>>(new Set([0]));
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [localUnits, setLocalUnits] = useState<Unit[]>(course?.units || []);
    const [dragSource, setDragSource] = useState<{ unitIdx: number; taskIdx: number } | null>(null);
    const [dragTarget, setDragTarget] = useState<{ unitIdx: number; taskIdx: number } | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);
    const [deleteModalData, setDeleteModalData] = useState<{ unitIdx: number; taskIdx: number } | null>(null);
    const [showExamManager, setShowExamManager] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showPDFManager, setShowPDFManager] = useState(false);

    // IndexedDB'den ders notlarını yükle (kalıcı storage)
    const { lectureNotes, saveLectureNotes, isLoading: notesLoading } = useLectureNotesStorage(courseId);

    useEffect(() => {
        if (!isDirty && course) {
            setLocalUnits(course.units);
        }
    }, [course, isDirty]);

    useEffect(() => {
        if (editingTaskId && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingTaskId]);

    if (!course) {
        return (
            <div className="p-6">
                <p className="text-slate-500">Course not found.</p>
            </div>
        );
    }

    const progress = getCourseProgress(course, completedTasks);

    const toggleUnit = (idx: number) => {
        const next = new Set(openUnits);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        setOpenUnits(next);
    };

    const handleDragStart = (unitIdx: number, taskIdx: number) => {
        setDragSource({ unitIdx, taskIdx });
    };

    const handleDragEnter = (unitIdx: number, taskIdx: number) => {
        if (dragSource && dragSource.unitIdx === unitIdx) {
            setDragTarget({ unitIdx, taskIdx });
        }
    };

    const handleDrop = (targetUnitIdx: number, targetTaskIdx: number) => {
        if (dragSource && dragSource.unitIdx === targetUnitIdx && dragSource.taskIdx !== targetTaskIdx) {
            const newUnits = [...localUnits];
            const tasks = [...newUnits[dragSource.unitIdx].tasks];
            const [movedTask] = tasks.splice(dragSource.taskIdx, 1);
            tasks.splice(targetTaskIdx, 0, movedTask);
            newUnits[dragSource.unitIdx].tasks = tasks;
            setLocalUnits(newUnits);
            setIsDirty(true);
        }
        setDragSource(null);
        setDragTarget(null);
    };

    const handleDragEnd = () => {
        setDragSource(null);
        setDragTarget(null);
    };

    // handleSave'i useCallback ile sarmalayarak bağımlılık sorununu çözüyoruz
    const handleSave = useCallback(() => {
        if (!course) return;
        setIsSaving(true);
        updateCourse(course.id, localUnits);
        setIsDirty(false);
        setTimeout(() => {
            setIsSaving(false);
            const event = new CustomEvent('toast', {
                detail: { message: 'Changes saved', type: 'success' }
            });
            window.dispatchEvent(event);
        }, 800);
    }, [course, localUnits, updateCourse]);

    // Auto-save effect - artık handleSave doğru şekilde bağımlılıklarda
    useEffect(() => {
        const timer = setInterval(() => {
            if (isDirty) {
                handleSave();
            }
        }, 30000);

        return () => clearInterval(timer);
    }, [isDirty, handleSave]);

    const handleAddTask = () => {
        if (!newTaskText.trim()) return;

        let dueDate: string | undefined;
        if (newTaskDate) {
            dueDate = newTaskDate;
            if (newTaskTime) {
                dueDate += 'T' + newTaskTime;
            }
        }

        addTaskToCourse(course.id, newTaskText, { dueDate });
        setNewTaskText('');
        setNewTaskDate('');
        setNewTaskTime('');

        // Provide feedback or scroll is handled by default behavior usually, but here we just update state
        const next = new Set(openUnits);
        next.add(localUnits.length - 1);
        setOpenUnits(next);
        setIsDirty(false); // addTaskToCourse updates global state, so we might not need local dirty if we sync, but here we often sync back.
        // Actually addTaskToCourse in context updates the global store.
        // But localUnits might be out of sync if we don't re-fetch or if we are in "dirty" mode.
        // The useEffect line 80: if (!isDirty && course) setLocalUnits(course.units) handles sync from prop.
        // Since we fired a global action, course prop will update.
        // If isDirty was true, we might have conflicts.
        // For safely, we should clear dirty flag so we accept the new task from props.
    };

    const startEditing = (task: Task) => {
        setEditingTaskId(task.id);
        setEditingText(task.text);
    };

    const saveEditing = (unitIdx: number, taskIdx: number) => {
        if (!editingTaskId) return;
        const newUnits = [...localUnits];
        newUnits[unitIdx].tasks[taskIdx].text = editingText;
        setLocalUnits(newUnits);
        setIsDirty(true);
        setEditingTaskId(null);
    };

    const confirmDelete = () => {
        if (!deleteModalData) return;
        const { unitIdx, taskIdx } = deleteModalData;

        if (unitIdx === -1 && taskIdx === -1) {
            deleteCourse(course.id);
            const event = new CustomEvent('toast', {
                detail: { message: 'Course deleted', type: 'success' }
            });
            window.dispatchEvent(event);
            setDeleteModalData(null);
            return;
        }

        const newUnits = [...localUnits];
        newUnits[unitIdx].tasks.splice(taskIdx, 1);
        setLocalUnits(newUnits);
        setIsDirty(true);
        setDeleteModalData(null);
    };

    const copySyllabus = async () => {
        try {
            const md = generateMarkdown(course, completedTasks);
            await navigator.clipboard.writeText(md);
            const event = new CustomEvent('toast', {
                detail: { message: 'Syllabus copied!', type: 'success' }
            });
            window.dispatchEvent(event);
        } catch (error) {
            const event = new CustomEvent('toast', {
                detail: { message: 'Copy failed', type: 'error' }
            });
            window.dispatchEvent(event);
        }
    };

    // Renk değiştirme fonksiyonu
    const handleColorChange = (preset: typeof COLOR_PRESETS[0]) => {
        updateCourseMeta(course.id, {
            color: preset.bg,
            customColor: preset.hex,
            bgGradient: preset.gradient
        });
        setShowColorPicker(false);
        const event = new CustomEvent('toast', {
            detail: { message: 'Course color updated', type: 'success' }
        });
        window.dispatchEvent(event);
    };

    const handleAddUnit = () => {
        const newUnit: Unit = {
            title: "New Unit",
            tasks: []
        };
        setLocalUnits([...localUnits, newUnit]);
        setIsDirty(true);
        // Open the new unit
        setOpenUnits(prev => new Set([...prev, localUnits.length]));
    };

    const handleDeleteUnit = (unitIdx: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this unit and all its tasks?')) {
            const newUnits = [...localUnits];
            newUnits.splice(unitIdx, 1);
            setLocalUnits(newUnits);
            setIsDirty(true);
        }
    };

    const handleAddTaskToUnit = (unitIdx: number, text: string) => {
        if (!text.trim()) return;
        const newUnits = [...localUnits];
        const newId = `${course.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        newUnits[unitIdx].tasks.push({
            id: newId,
            text: text.trim(),
            // other properties will be optional or default
        });
        setLocalUnits(newUnits);
        setIsDirty(true);
    };

    const handleUpdateUnitTitle = (unitIdx: number, newTitle: string) => {
        const newUnits = [...localUnits];
        newUnits[unitIdx].title = newTitle;
        setLocalUnits(newUnits);
        setIsDirty(true);
    };

    // Get only future exams (don't show negative days)
    const upcomingExams = (course.exams || []).filter(exam => {
        const examDate = new Date(exam.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return examDate >= today;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const nextExamInfo = (() => {
        if (upcomingExams.length === 0) return null;
        const nextExam = upcomingExams[0];
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const examDate = new Date(nextExam.date);
        const days = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        return { days, title: nextExam.title, time: nextExam.time };
    })();

    // Calculate days left for exams (for midterm and final)
    const examCountdowns = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return upcomingExams.map(exam => {
            const examDate = new Date(exam.date);
            const days = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
            return { ...exam, daysLeft: days };
        });
    }, [upcomingExams]);

    return (
        <div className="animate-fade-in pb-20">
            <ConfirmationModal
                isOpen={!!deleteModalData}
                onClose={() => setDeleteModalData(null)}
                onConfirm={confirmDelete}
                title={deleteModalData?.unitIdx === -1 ? "Delete Course" : "Delete Task"}
                message={deleteModalData?.unitIdx === -1
                    ? "Are you sure you want to delete this entire course? This action cannot be undone."
                    : "Are you sure you want to delete this task? This action cannot be undone."}
            />

            <div className={`relative ${course.bgGradient} p-6 md:p-10`}>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full transform translate-x-10 -translate-y-10 blur-3xl"></div>
                </div>
                <div className="relative z-10 w-full flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-bold mb-3 inline-block shadow-sm">
                                {course.code}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white shadow-black drop-shadow-lg">{course.title}</h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">                        <div className="flex gap-2 items-center flex-wrap">
                        {/* View Toggle */}
                        <div className="bg-white/20 p-1 rounded-xl backdrop-blur-md flex items-center gap-1">
                            <button
                                onClick={() => {
                                    if (isDirty) handleSave();
                                    setViewMode('list');
                                }}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
                                title="List View"
                            >
                                <List size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    if (isDirty) handleSave();
                                    setViewMode('board');
                                }}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'board' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
                                title="Kanban Board"
                            >
                                <LayoutDashboard size={16} />
                            </button>
                        </div>
                        {/* Save Status */}
                        <button
                            onClick={handleSave}
                            className={`px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-md transition-colors shadow-sm flex items-center gap-2 hover:scale-105 ${isDirty ? 'bg-amber-500/80 text-white' : isSaving ? 'bg-indigo-500/80 text-white' : 'bg-white/20 text-white'
                                }`}
                            title="Click to Save"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" /> Saving...
                                </>
                            ) : isDirty ? (
                                <>
                                    <Save size={14} /> Unsaved
                                </>
                            ) : (
                                <>
                                    <Check size={14} /> Saved
                                </>
                            )}
                        </button>

                        {/* Syllabus Copy */}
                        <button
                            onClick={copySyllabus}
                            className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm hover:scale-105"
                        >
                            <Copy size={14} /> Syllabus
                        </button>

                        <button
                            onClick={() => setDeleteModalData({ unitIdx: -1, taskIdx: -1 })} // Special value for course deletion
                            className="bg-white/20 hover:bg-red-500/80 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm hover:scale-105"
                            title="Delete Course"
                        >
                            <Trash2 size={14} /> Delete
                        </button>

                        {/* Color Picker Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowColorPicker(prev => !prev)}
                                className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm hover:scale-105"
                                title="Change Course Color"
                            >
                                <Palette size={14} />
                                <div
                                    className="w-3 h-3 rounded-full border border-white/50 shadow-sm"
                                    style={{ backgroundColor: course.customColor || '#3b82f6' }}
                                />
                            </button>

                            {/* Color Palette Dropdown */}
                            {showColorPicker && (
                                <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-3 z-[100] animate-fade-in min-w-[200px] border border-slate-100 dark:border-slate-700 max-h-[300px] overflow-visible">
                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">Select Color</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {COLOR_PRESETS.map(preset => (
                                            <button
                                                key={preset.hex}
                                                onClick={() => handleColorChange(preset)}
                                                className={`w-full aspect-square rounded-lg transition-transform hover:scale-110 shadow-sm ${course.customColor === preset.hex ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' : ''
                                                    }`}
                                                style={{ backgroundColor: preset.hex }}
                                                title={preset.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Exam Countdown Buttons - Midterm then Final */}
                        {examCountdowns.slice(0, 2).map(exam => (
                            <div
                                key={exam.id}
                                className={`px-3 py-2 rounded-xl backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-default ${exam.daysLeft <= 3
                                    ? 'bg-red-500/80 animate-pulse'
                                    : exam.daysLeft <= 7
                                        ? 'bg-orange-500/70'
                                        : 'bg-white/20'
                                    }`}
                                title={`${exam.title} - ${new Date(exam.date).toLocaleDateString('en-US')}`}
                            >
                                <ClockIcon size={14} />
                                <span>{exam.title.includes('Vize') || exam.title.includes('Midterm') ? 'Midterm' : exam.title.includes('Final') ? 'Final' : exam.title}</span>
                                <span className="bg-white/20 px-1.5 py-0.5 rounded-md font-black">{exam.daysLeft}d</span>
                            </div>
                        ))}

                        {/* Last Uploaded PDF - Quick Access */}
                        {lectureNotes && lectureNotes.length > 0 && (
                            <LastPDFButton
                                lectureNote={lectureNotes[lectureNotes.length - 1]}
                                onClick={() => { }}
                                courseColor={course.customColor}
                            />
                        )}

                        {/* PDF Manager Button */}
                        <PDFManagerButton
                            onClick={() => setShowPDFManager(true)}
                            noteCount={lectureNotes?.length || 0}
                        />

                        {/* Exam Calendar Button - For detailed list */}
                        {upcomingExams.length > 0 && (
                            <button
                                onClick={() => setShowExamManager(prev => !prev)}
                                className="bg-white/10 backdrop-blur-md hover:bg-white/20 px-3 py-2 rounded-xl border border-white/20 flex items-center gap-2 text-white transition-all hover:scale-105"
                                title="Exam Details"
                            >
                                <Calendar size={14} />
                                <ChevronDown size={14} className={`transition-transform ${showExamManager ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>

                        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg">
                            <div className="text-right">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Progress</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-white">%{progress}</p>
                            </div>
                            <CircularProgress percentage={progress} colorClass={course.color.split(' ')[0].replace('bg-', 'text-')} size={40} />
                        </div>
                    </div>

                    {/* Exam List - View Only */}
                    {showExamManager && upcomingExams.length > 0 && (
                        <div className="bg-white dark:bg-dark-surface rounded-xl p-4 shadow-xl border border-slate-100 dark:border-slate-700 animate-fade-in mt-2">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                <Calendar size={14} /> Upcoming Exams
                            </h3>
                            <div className="space-y-2">
                                {upcomingExams.map(exam => {
                                    const examDate = new Date(exam.date);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const daysLeft = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

                                    return (
                                        <div
                                            key={exam.id}
                                            className={`flex items-center justify-between p-3 rounded-lg ${daysLeft <= 3
                                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                                : daysLeft <= 7
                                                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                                                    : 'bg-slate-50 dark:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: course.customColor || '#3b82f6' }}
                                                />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{exam.title}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {examDate.toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'long'
                                                        })}
                                                        {exam.time && ` • ${exam.time}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`text-right ${daysLeft <= 3
                                                ? 'text-red-600 dark:text-red-400'
                                                : daysLeft <= 7
                                                    ? 'text-orange-600 dark:text-orange-400'
                                                    : 'text-slate-600 dark:text-slate-400'
                                                }`}>
                                                <span className="text-lg font-bold">{daysLeft}</span>
                                                <span className="text-xs block">days</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={`p-6 max-w-4xl mx-auto space-y-4 -mt-6 relative z-20 ${viewMode === 'board' ? 'max-w-[1400px] h-[calc(100vh-300px)]' : ''}`}>
                {viewMode === 'board' ? (
                    <div className="h-full bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl border border-white/10 backdrop-blur-sm overflow-hidden">
                        <KanbanBoard
                            courses={[course]}
                            onTaskUpdate={updateTaskStatus}
                            onOpenTask={onOpenTaskDetails}
                            hideFilter
                            onAddTask={(status) => {
                                // For now, we just focus the add task input.
                                // In a future iteration, we could pre-select the status or open a specific modal.
                                // If we want to support adding to specific status immediately, we'd need to update our addTaskToCourse to accept status.
                                // As per plan, we might just focus for now or let the user know.
                                // Let's scroll to bottom and focus.
                                const input = document.querySelector('input[placeholder="Task description..."]') as HTMLInputElement;
                                if (input) {
                                    input.scrollIntoView({ behavior: 'smooth' });
                                    input.focus();
                                    // Optional: We could store the intended status in a ref or state to use when adding
                                    // But addTaskToCourse currently appends to a Unit, not a Status directly (status is on Task).
                                    // We'd need to refactor addTaskToCourse or Task creation to support initial status.
                                    // For now, let's keep it simple: Just focus.
                                }
                            }}
                        />
                    </div>
                ) : (
                    localUnits.map((unit, unitIdx) => {
                        const unitCompleted = unit.tasks.filter(t => completedTasks.has(t.id)).length;
                        const isAllDone = unitCompleted === unit.tasks.length && unit.tasks.length > 0;
                        const isOpen = openUnits.has(unitIdx);

                        return (
                            <div
                                key={unitIdx}
                                className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md"
                            >
                                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors" onClick={() => toggleUnit(unitIdx)}>
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`p-2 rounded-lg ${isAllDone ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                                            }`}>
                                            {isAllDone ? <CheckCircle size={20} /> : <BookOpen size={20} />}
                                        </div>
                                        <input
                                            type="text"
                                            value={unit.title}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => handleUpdateUnitTitle(unitIdx, e.target.value)}
                                            className="font-medium bg-transparent border-none focus:ring-0 p-0 w-full text-slate-800 dark:text-slate-200"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 pl-4">
                                        <span className="text-xs text-slate-400 font-medium">
                                            {unitCompleted} / {unit.tasks.length}
                                        </span>
                                        <button
                                            onClick={(e) => handleDeleteUnit(unitIdx, e)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                            title="Delete Unit"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <span className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </div>
                                </div>

                                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-black/20">
                                            {unit.tasks.map((task, taskIdx) => (
                                                <div
                                                    key={task.id}
                                                    draggable={editingTaskId !== task.id}
                                                    onDragStart={() => handleDragStart(unitIdx, taskIdx)}
                                                    onDragEnter={() => handleDragEnter(unitIdx, taskIdx)}
                                                    onDragOver={event => event.preventDefault()}
                                                    onDrop={event => {
                                                        event.preventDefault();
                                                        handleDrop(unitIdx, taskIdx);
                                                    }}
                                                    onDragEnd={handleDragEnd}
                                                    className={`flex items-center gap-3 p-4 pl-6 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group relative ${dragTarget?.taskIdx === taskIdx && dragTarget.unitIdx === unitIdx ? 'border-t-2 border-t-indigo-500' : ''
                                                        } ${dragSource?.taskIdx === taskIdx && dragSource.unitIdx === unitIdx ? 'opacity-50 bg-slate-100 dark:bg-slate-800' : ''}`}
                                                >
                                                    <div className="text-slate-300 dark:text-slate-600 cursor-grab hover:text-slate-500 active:cursor-grabbing">
                                                        <GripVertical size={16} />
                                                    </div>
                                                    <button
                                                        onClick={() => toggleTask(task.id)}
                                                        className="cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
                                                        aria-label={completedTasks.has(task.id) ? "Mark as incomplete" : "Mark as complete"}
                                                    >
                                                        <Checkmark checked={completedTasks.has(task.id)} />
                                                    </button>

                                                    <div className="flex-1 min-w-0">
                                                        {editingTaskId === task.id ? (
                                                            <input
                                                                ref={editInputRef}
                                                                type="text"
                                                                value={editingText}
                                                                onChange={e => setEditingText(e.target.value)}
                                                                onBlur={() => saveEditing(unitIdx, taskIdx)}
                                                                onKeyDown={e => e.key === 'Enter' && saveEditing(unitIdx, taskIdx)}
                                                                className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <p
                                                                        onClick={() => startEditing(task)}
                                                                        className={`text-sm cursor-text truncate transition-all relative ${completedTasks.has(task.id)
                                                                            ? 'text-slate-400'
                                                                            : 'text-slate-700 dark:text-slate-300'
                                                                            }`}
                                                                    >
                                                                        {task.text}
                                                                        <span
                                                                            className={`absolute left-0 top-1/2 h-0.5 bg-slate-400 dark:bg-slate-500 transition-all duration-500 ease-in-out ${completedTasks.has(task.id) ? 'w-full opacity-100' : 'w-0 opacity-0'
                                                                                }`}
                                                                        ></span>
                                                                    </p>
                                                                    <button
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            window.open(
                                                                                `https://www.google.com/search?q=${encodeURIComponent(task.text)}`,
                                                                                '_blank'
                                                                            );
                                                                        }}
                                                                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-3 md:p-1 text-slate-300 hover:text-blue-500 transition-all"
                                                                        title="Quick Search on Google"
                                                                        aria-label={`Search on Google for ${task.text}`}
                                                                    >
                                                                        <Globe size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            window.open(
                                                                                `https://www.youtube.com/results?search_query=${encodeURIComponent(task.text)}`,
                                                                                '_blank'
                                                                            );
                                                                        }}
                                                                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-3 md:p-1 text-slate-300 hover:text-red-500 transition-all"
                                                                        title="Quick Search on YouTube"
                                                                        aria-label={`Search on YouTube for ${task.text}`}
                                                                    >
                                                                        <Youtube size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            window.open(
                                                                                `https://chatgpt.com/?q=${encodeURIComponent(task.text)}`,
                                                                                '_blank'
                                                                            );
                                                                        }}
                                                                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-3 md:p-1 text-slate-300 hover:text-emerald-500 transition-all"
                                                                        title="Ask ChatGPT"
                                                                        aria-label={`Ask ChatGPT about ${task.text}`}
                                                                    >
                                                                        <Bot size={16} />
                                                                    </button>
                                                                    {task.tags?.map(tag => (
                                                                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded hidden md:inline-block">
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                {task.subtasks && task.subtasks.length > 0 && (
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-green-400"
                                                                                style={{
                                                                                    width: `${(task.subtasks.filter(sub => sub.completed).length / task.subtasks.length) * 100}%`
                                                                                }}
                                                                            ></div>
                                                                        </div>
                                                                        <span className="text-[10px] text-slate-400">
                                                                            {task.subtasks.filter(sub => sub.completed).length}/{task.subtasks.length}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => onOpenTaskDetails(task)}
                                                            className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                                            title="Details & Notes"
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteModalData({ unitIdx, taskIdx })}
                                                            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                            title="Delete Task"
                                                            aria-label="Delete Task"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {unit.tasks.length === 0 && (
                                                <p className="p-4 text-center text-sm text-slate-400 italic">No tasks in this unit yet.</p>
                                            )}

                                            {/* Add Task to Unit Input */}
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Add a new task..."
                                                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleAddTaskToUnit(unitIdx, e.currentTarget.value);
                                                                e.currentTarget.value = '';
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                            handleAddTaskToUnit(unitIdx, input.value);
                                                            input.value = '';
                                                        }}
                                                        className="p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }))}

                <button
                    onClick={handleAddUnit}
                    className="w-full md:w-auto md:px-12 mx-auto py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={20} /> Add New Unit
                </button>
            </div >

            {
                isDirty && (
                    <div className="fixed bottom-20 md:bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 hover:scale-105 transition-all font-bold disabled:opacity-70 disabled:scale-100"
                        >
                            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )
            }

            {/* PDF Manager Popup */}
            <LectureNotesPopup
                isOpen={showPDFManager}
                onClose={() => setShowPDFManager(false)}
                lectureNotes={lectureNotes}
                onUpdate={saveLectureNotes}
                courseColor={course.customColor}
            />
        </div >
    );
};
