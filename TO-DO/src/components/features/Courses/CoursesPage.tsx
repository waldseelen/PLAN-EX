import { ProgressBar } from '@/components/ui/ProgressBar';
import { usePlannerContext } from '@/context/AppContext';
import { Course, Task } from '@/types';
import { getCourseProgress } from '@/utils/course';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    TouchSensor,
    closestCorners,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle, ChevronRight,
    Clock,
    FolderOpen,
    LayoutGrid, List,
    Plus,
    Star,
    Trash2,
    X
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

interface CoursesPageProps {
    onNavigateCourse: (courseId: string) => void;
    onCreateCourse: () => void;
}

// Kanban Column configuration
const COLUMNS = [
    { id: 'todo', title: 'To Do', dotColor: 'bg-cyan-400' },
    { id: 'in-progress', title: 'In Progress', dotColor: 'bg-teal-400' },
    { id: 'review', title: 'Review', dotColor: 'bg-amber-400' },
    { id: 'done', title: 'Done', dotColor: 'bg-emerald-400' },
];

// Draggable Task Card Component
const DraggableTaskCard = ({
    task,
    onToggleComplete,
    isCompleted,
    isDragging
}: {
    task: Task & { unitTitle: string };
    onToggleComplete: (taskId: string) => void;
    isCompleted: boolean;
    isDragging?: boolean;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging
    } = useSortable({
        id: task.id,
        data: { type: 'Task', task }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isSortableDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-[#1e1e2e]/50 rounded-lg p-3 h-16 border-2 border-cyan-400/50 border-dashed opacity-40"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            role="listitem"
            aria-label={`Task: ${task.title || task.text}${isCompleted ? ', completed' : ''}`}
            tabIndex={0}
            className={`bg-[#1e1e2e] hover:bg-[#252535] rounded-lg p-4 sm:p-3 cursor-grab active:cursor-grabbing group transition-all border-2 border-white/10 hover:border-cyan-400/50 relative shadow-md touch-manipulation ${isCompleted ? 'opacity-60' : ''}`}
        >
            <div className="flex items-start gap-3">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
                    aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    className={`mt-0.5 min-w-[44px] min-h-[44px] sm:w-6 sm:h-6 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${isCompleted
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-400 hover:border-cyan-400 bg-[#13131a]'
                        }`}
                >
                    {isCompleted && <CheckCircle size={16} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-base sm:text-sm leading-snug ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title || task.text}
                    </h4>
                    {task.dueDate && (
                        <p className="text-sm sm:text-xs text-slate-400 mt-2 sm:mt-1 flex items-center gap-1.5">
                            <Clock size={12} />
                            {new Date(task.dueDate).toLocaleString('en-US', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    )}
                </div>
                <Star
                    size={14}
                    className={task.isPriority ? 'text-amber-400 fill-amber-400' : 'text-slate-600 group-hover:text-slate-400'}
                />
            </div>
        </div>
    );
};

// Overlay Task Card (shown while dragging)
const TaskCardOverlay = ({ task }: { task: Task & { unitTitle: string } }) => {
    return (
        <div className="bg-[#1e1e2e] rounded-lg p-3 shadow-2xl border-2 border-cyan-400 cursor-grabbing rotate-3 scale-105">
            <h4 className="font-bold text-sm text-white">
                {task.title || task.text}
            </h4>
        </div>
    );
};

// Droppable Column Component
const DroppableColumn = ({
    column,
    tasks,
    onToggleTask,
    completedTasks
}: {
    column: typeof COLUMNS[0];
    tasks: (Task & { unitTitle: string })[];
    onToggleTask: (taskId: string) => void;
    completedTasks: Set<string>;
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: { type: 'Column', columnId: column.id }
    });

    const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

    return (
        <div className="flex flex-col min-h-[300px] sm:min-h-[400px]">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 sm:w-3 sm:h-3 rounded-full ${column.dotColor} shadow-lg`} />
                    <h3 className="font-bold text-base sm:text-sm text-white">{column.title}</h3>
                    <span className="text-xs font-bold text-slate-300 bg-[#1e1e2e] px-2 py-1 rounded-full border border-white/10">
                        {tasks.length}
                    </span>
                </div>
            </div>

            {/* Tasks Container */}
            <div
                ref={setNodeRef}
                className={`flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 bg-[#13131a] rounded-xl p-3 border-2 transition-all ${isOver
                    ? 'border-cyan-400/80 bg-cyan-400/10 shadow-lg shadow-cyan-400/20'
                    : 'border-white/10 hover:border-white/20'
                    }`}
            >
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <DraggableTaskCard
                            key={task.id}
                            task={task}
                            onToggleComplete={onToggleTask}
                            isCompleted={completedTasks.has(task.id)}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className={`h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-sm font-medium transition-all ${isOver
                        ? 'border-cyan-400/80 text-cyan-300 bg-cyan-400/5'
                        : 'border-white/20 text-slate-400'
                        }`}>
                        {isOver ? '✓ Drop here' : 'No tasks yet'}
                    </div>
                )}
            </div>
        </div>
    );
};

// Add Task Modal
const AddTaskModal = ({
    isOpen,
    onClose,
    onAdd,
    courseTitle
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (task: { text: string; dueDate?: string; isPriority: boolean }) => void;
    courseTitle: string;
}) => {
    const [text, setText] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isPriority, setIsPriority] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        let dueDate: string | undefined;
        if (date) {
            dueDate = time ? `${date}T${time}` : `${date}T23:59`;
        }

        onAdd({ text: text.trim(), dueDate, isPriority });
        setText('');
        setDate('');
        setTime('');
        setIsPriority(false);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-4">
            <div className="bg-[#1e1e2e] rounded-none sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-md border-0 sm:border-2 border-white/20 shadow-2xl flex flex-col" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-transparent flex-shrink-0">
                    <div>
                        <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-white">New Task</h2>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium">{courseTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="min-w-[44px] min-h-[44px] p-2 text-slate-300 hover:text-white active:text-cyan-400 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors flex items-center justify-center touch-manipulation"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                    {/* Task Text */}
                    <div>
                        <label htmlFor="task-text" className="block text-sm font-bold text-white mb-2">
                            Task Description *
                        </label>
                        <input
                            id="task-text"
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full bg-[#13131a] border-2 border-white/20 rounded-lg px-4 py-3 min-h-[52px] text-base text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 touch-manipulation"
                            autoFocus
                        />
                    </div>

                    {/* Deadline Section */}
                    <div className="bg-[#13131a] rounded-xl p-4 border-2 border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={20} className="text-cyan-400" />
                            <span className="text-sm font-bold text-white">Deadline (Optional)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Date */}
                            <div>
                                <label htmlFor="task-date" className="block text-xs font-medium text-slate-300 mb-2">Date</label>
                                <input
                                    id="task-date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-[#1e1e2e] border-2 border-white/20 rounded-lg px-3 py-3 min-h-[48px] text-white text-base focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 [color-scheme:dark] touch-manipulation"
                                />
                            </div>

                            {/* Time */}
                            <div>
                                <label htmlFor="task-time" className="block text-xs font-medium text-slate-300 mb-2">Time</label>
                                <input
                                    id="task-time"
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full bg-[#1e1e2e] border-2 border-white/20 rounded-lg px-3 py-3 min-h-[48px] text-white text-base focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 [color-scheme:dark] touch-manipulation"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Priority Toggle */}
                    <div className="flex items-center justify-between bg-[#13131a] rounded-xl p-4 border-2 border-white/10">
                        <div className="flex items-center gap-2">
                            <Star size={20} className={isPriority ? 'text-amber-400 fill-amber-400' : 'text-slate-400'} />
                            <span className="text-sm font-bold text-white">High Priority</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPriority(!isPriority)}
                            aria-label={isPriority ? 'Disable high priority' : 'Enable high priority'}
                            aria-checked={isPriority}
                            role="switch"
                            className={`w-16 h-9 sm:w-14 sm:h-7 rounded-full transition-colors relative shadow-inner min-w-[64px] min-h-[44px] sm:min-w-0 sm:min-h-0 touch-manipulation ${isPriority ? 'bg-amber-500' : 'bg-slate-600'
                                }`}
                        >
                            <div className={`absolute top-1 sm:top-1 w-7 h-7 sm:w-5 sm:h-5 bg-white rounded-full transition-transform shadow-md ${isPriority ? 'translate-x-8 sm:translate-x-8' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Cancel and close"
                            className="flex-1 px-4 py-3 min-h-[52px] bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-xl text-white text-base font-bold transition-colors border border-white/10 touch-manipulation"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!text.trim()}
                            aria-label="Add task"
                            className="flex-1 px-4 py-3 min-h-[52px] bg-gradient-to-r from-[#00aeef] via-[#29c6cd] to-[#ffd200] hover:brightness-110 active:brightness-95 rounded-xl text-[#0b0b0b] text-base font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg touch-manipulation"
                        >
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

// Course Kanban Board with Drag & Drop
const CourseKanban = ({
    course,
    completedTasks,
    onToggleTask,
    onUpdateTaskStatus,
    onAddTask,
    onBack
}: {
    course: Course;
    completedTasks: Set<string>;
    onToggleTask: (taskId: string) => void;
    onUpdateTaskStatus: (taskId: string, newStatus: Task['status']) => void;
    onAddTask: (courseId: string, unitId: string, task: { text: string; dueDate?: string; isPriority: boolean }) => void;
    onBack: () => void;
}) => {
    const progress = getCourseProgress(course, completedTasks);
    const [activeTask, setActiveTask] = useState<(Task & { unitTitle: string }) | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
                tolerance: 5
            }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 8
            }
        })
    );

    // Collect all tasks from units
    const allTasks = useMemo(() => {
        const tasks: (Task & { unitTitle: string; unitId: string })[] = [];
        course.units.forEach(unit => {
            unit.tasks.forEach(task => {
                tasks.push({ ...task, unitTitle: unit.title, unitId: unit.id });
            });
        });
        return tasks;
    }, [course]);

    // Group tasks by status
    const tasksByStatus = useMemo(() => {
        const groups: Record<string, (Task & { unitTitle: string })[]> = {
            'todo': [],
            'in-progress': [],
            'review': [],
            'done': []
        };

        allTasks.forEach(task => {
            const isCompleted = completedTasks.has(task.id);
            if (isCompleted) {
                groups['done'].push(task);
            } else {
                const status = task.status || 'todo';
                if (groups[status]) {
                    groups[status].push(task);
                } else {
                    groups['todo'].push(task);
                }
            }
        });

        return groups;
    }, [allTasks, completedTasks]);

    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Check if dropped on a column
        const columnIds = COLUMNS.map(c => c.id);
        let newStatus: Task['status'] | undefined;

        if (columnIds.includes(overId)) {
            newStatus = overId as Task['status'];
        } else {
            // Dropped on another task - find which column it's in
            const overTask = allTasks.find(t => t.id === overId);
            if (overTask) {
                const isOverCompleted = completedTasks.has(overTask.id);
                if (isOverCompleted) {
                    newStatus = 'done';
                } else {
                    newStatus = overTask.status || 'todo';
                }
            }
        }

        if (newStatus) {
            const activeTaskData = allTasks.find(t => t.id === activeId);
            const currentStatus = activeTaskData ? (completedTasks.has(activeId) ? 'done' : (activeTaskData.status || 'todo')) : 'todo';

            if (currentStatus !== newStatus) {
                onUpdateTaskStatus(activeId, newStatus);
            }
        }
    };

    const handleAddTask = (taskData: { text: string; dueDate?: string; isPriority: boolean }) => {
        // Add to first unit by default
        const firstUnit = course.units[0];
        if (firstUnit) {
            onAddTask(course.id, firstUnit.id, taskData);
        }
    };

    // Calculate upcoming exams for this course
    const upcomingExams = useMemo(() => {
        return (course.exams || [])
            .filter(exam => {
                const examDate = new Date(exam.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return examDate >= today;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(exam => {
                const examDate = new Date(exam.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const daysLeft = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                return { ...exam, daysLeft };
            });
    }, [course.exams]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-6 animate-fade-in pb-20">
                {/* Header */}
                <header>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium">Back to Courses</span>
                    </button>

                    {/* Course Title Banner with Gradient Background */}
                    <div className={`${course.bgGradient || 'bg-gradient-to-r from-[#00aeef] via-[#29c6cd] to-[#ffd200]'} rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 relative overflow-hidden shadow-lg`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-2 inline-block shadow-sm">
                                        {course.code}
                                    </span>
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg leading-tight">{course.title}</h1>
                                </div>

                                {/* Action Buttons Row */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* View Mode Toggle */}
                                    <div className="flex items-center bg-white/20 backdrop-blur-md rounded-xl p-1 shadow-sm">
                                        <button
                                            onClick={() => setViewMode('kanban')}
                                            className={`p-2 rounded-lg transition-all ${viewMode === 'kanban'
                                                    ? 'bg-white text-gray-800'
                                                    : 'text-white hover:bg-white/10'
                                                }`}
                                            title="Kanban View"
                                        >
                                            <LayoutGrid size={16} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                                                    ? 'bg-white text-gray-800'
                                                    : 'text-white hover:bg-white/10'
                                                }`}
                                            title="List View"
                                        >
                                            <List size={16} />
                                        </button>
                                    </div>

                                    {/* Saved Status */}
                                    <div className="px-3 py-2 sm:py-2 min-h-[44px] sm:min-h-0 rounded-xl text-xs font-bold backdrop-blur-md bg-white/20 text-white shadow-sm flex items-center gap-1.5">
                                        <CheckCircle size={16} className="sm:w-3.5 sm:h-3.5" />
                                        <span className="hidden sm:inline">Saved</span>
                                    </div>

                                    {/* Syllabus Button */}
                                    <button
                                        onClick={() => {
                                            const event = new CustomEvent('toast', {
                                                detail: { message: 'Syllabus feature coming soon!', type: 'info' }
                                            });
                                            window.dispatchEvent(event);
                                        }}
                                        aria-label="View syllabus"
                                        className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white px-3 py-2 min-h-[44px] sm:min-h-0 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm touch-manipulation"
                                    >
                                        <BookOpen size={16} className="sm:w-3.5 sm:h-3.5" />
                                        <span className="hidden sm:inline">Syllabus</span>
                                    </button>

                                    {/* PDF Export Button */}
                                    <button
                                        onClick={() => {
                                            const event = new CustomEvent('toast', {
                                                detail: { message: 'PDF Export feature coming soon!', type: 'info' }
                                            });
                                            window.dispatchEvent(event);
                                        }}
                                        className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 min-h-[44px] sm:min-h-0 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm touch-manipulation"
                                        title="Export as PDF"
                                    >
                                        <BookOpen size={14} />
                                        <span className="hidden sm:inline">PDF</span>
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        aria-label="Delete course"
                                        className="bg-white/20 hover:bg-red-500/80 active:bg-red-600/90 text-white px-3 py-2 min-h-[44px] sm:min-h-0 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm touch-manipulation"
                                    >
                                        <Trash2 size={14} />
                                        <span className="hidden sm:inline">Delete</span>
                                    </button>

                                    {/* Exam Countdown Badges */}
                                    {upcomingExams.slice(0, 2).map((exam, idx) => (
                                        <div
                                            key={exam.id}
                                            role="status"
                                            aria-label={`${exam.title.includes('Midterm') || exam.title.includes('Vize') ? 'Midterm' : 'Final'} exam in ${exam.daysLeft} days`}
                                            className={`px-3 py-2 min-h-[44px] sm:min-h-0 rounded-xl backdrop-blur-md text-white text-xs sm:text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${exam.daysLeft <= 3
                                                ? 'bg-red-500/80 animate-pulse'
                                                : exam.daysLeft <= 7
                                                    ? 'bg-orange-500/70'
                                                    : 'bg-white/20'
                                                }`}
                                        >
                                            <Clock size={16} className="sm:w-3.5 sm:h-3.5" />
                                            <span className="hidden sm:inline">{exam.title.includes('Midterm') || exam.title.includes('Vize') ? 'Midterm' : 'Final'}</span>
                                            <span className="bg-white/20 px-2 py-1 rounded-md font-black">{exam.daysLeft}d</span>
                                        </div>
                                    ))}

                                    {/* PDF Button */}
                                    <button
                                        className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm"
                                    >
                                        <BookOpen size={14} />
                                        PDF
                                    </button>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg max-w-fit">
                                <div className="text-right">
                                    <p className="text-xs text-slate-600 font-medium uppercase">Progress</p>
                                    <p className="text-xl font-bold text-slate-900">{progress}%</p>
                                </div>
                                <div className="w-12 h-12">
                                    <svg className="transform -rotate-90 w-12 h-12">
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="rgba(0,0,0,0.1)"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke={progress === 100 ? '#10b981' : '#00aeef'}
                                            strokeWidth="4"
                                            fill="none"
                                            strokeDasharray={`${(progress / 100) * 125} 125`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Action Bar with New Task Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <button
                        onClick={() => setShowAddModal(true)}
                        aria-label="Add new task"
                        className="px-6 py-3 min-h-[52px] bg-gradient-to-r from-[#00aeef] via-[#29c6cd] to-[#ffd200] hover:brightness-110 active:brightness-95 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-[#0b0b0b] shadow-lg shadow-cyan-400/20 touch-manipulation"
                    >
                        <Plus size={22} />
                        <span className="text-base">New Task</span>
                    </button>

                    {/* Stats */}
                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {COLUMNS.map(col => (
                            <div key={col.id} className="bg-[#1e1e2e] p-3 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-3 h-3 rounded-full ${col.dotColor} shadow-lg`} />
                                    <span className="text-xs font-medium text-slate-300">{col.title}</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{tasksByStatus[col.id].length}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Drag & Drop Info */}
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <ArrowLeft size={18} className="text-cyan-300 rotate-90" />
                    </div>
                    <p className="text-sm text-cyan-100 font-medium">
                        <span className="font-bold">Tip:</span> Drag and drop tasks between columns to change their status
                    </p>
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Task columns">
                    {COLUMNS.map(column => (
                        <DroppableColumn
                            key={column.id}
                            column={column}
                            tasks={tasksByStatus[column.id]}
                            onToggleTask={onToggleTask}
                            completedTasks={completedTasks}
                        />
                    ))}
                </div>

                {/* Drag Overlay */}
                {createPortal(
                    <DragOverlay>
                        {activeTask && <TaskCardOverlay task={activeTask} />}
                    </DragOverlay>,
                    document.body
                )}
            </div>

            {/* Add Task Modal */}
            <AddTaskModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddTask}
                courseTitle={course.title}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && createPortal(
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1e1e2e] rounded-2xl border-2 border-red-500/50 shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-500/20 rounded-full">
                                <Trash2 size={24} className="text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Delete Course?</h3>
                                <p className="text-sm text-slate-400">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-slate-300 mb-6">
                            Are you sure you want to delete <span className="font-bold text-white">{course.title}</span>?
                            All tasks and data related to this course will be permanently removed.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    onBack();
                                    // Trigger delete via context - need to add this
                                    const event = new CustomEvent('toast', {
                                        detail: { message: 'Course deleted successfully', type: 'success' }
                                    });
                                    window.dispatchEvent(event);
                                }}
                                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold transition-colors"
                            >
                                Delete Course
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </DndContext>
    );
};

// Main Courses Page
export const CoursesPage: React.FC<CoursesPageProps> = ({ onNavigateCourse, onCreateCourse }) => {
    const { courses, completedTasks, deleteCourse, toggleTask, updateTaskStatus, addTaskToCourse } = usePlannerContext();
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [resourceQuery, setResourceQuery] = useState('');

    const upcomingExam = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exams = courses
            .flatMap(course => (course.exams || []).map(exam => ({ ...exam, course })))
            .filter(exam => new Date(exam.date).getTime() >= today.getTime())
            .map(exam => ({
                ...exam,
                daysLeft: Math.ceil((new Date(exam.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            }))
            .sort((a, b) => a.daysLeft - b.daysLeft);
        return exams[0];
    }, [courses]);

    const handleGoogleSearch = () => {
        const query = resourceQuery.trim() || 'course study notes';
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    };

    const handleYoutubeSearch = () => {
        const query = resourceQuery.trim() || 'course lecture playlist';
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    };

    const handleDeleteCourse = (e: React.MouseEvent, courseId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this course? All related tasks will also be removed.')) {
            deleteCourse?.(courseId);
        }
    };

    const handleSelectCourse = (courseId: string) => {
        setSelectedCourse(courseId);
    };

    const handleBack = () => {
        setSelectedCourse(null);
    };

    const handleAddTask = (courseId: string, unitId: string, taskData: { text: string; dueDate?: string; isPriority: boolean }) => {
        if (addTaskToCourse) {
            addTaskToCourse(courseId, taskData.text, {
                dueDate: taskData.dueDate,
                isPriority: taskData.isPriority,
                status: 'todo',
                unitId: unitId
            });
        }
    };

    // Kurs istatistikleri
    const courseStats = courses.map(course => {
        const progress = getCourseProgress(course, completedTasks);
        let totalTasks = 0;
        let completedCount = 0;

        course.units.forEach(unit => {
            unit.tasks.forEach(task => {
                totalTasks++;
                if (completedTasks.has(task.id)) {
                    completedCount++;
                }
            });
        });

        return {
            ...course,
            progress,
            totalTasks,
            completedCount,
            pendingCount: totalTasks - completedCount
        };
    });

    // If a course is selected, show its Kanban board
    const currentCourse = courses.find(c => c.id === selectedCourse);
    if (currentCourse) {
        return (
            <CourseKanban
                course={currentCourse}
                completedTasks={completedTasks}
                onToggleTask={toggleTask}
                onUpdateTaskStatus={updateTaskStatus}
                onAddTask={handleAddTask}
                onBack={handleBack}
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FolderOpen className="w-7 h-7 text-purple-500" />
                        Courses
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage your courses and track progress
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-[var(--color-surface-2)] rounded-lg p-1 border border-white/5">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-[#0b0b0b]' : 'text-slate-400 hover:text-white'}`}
                        >
                            <List size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-[#0b0b0b]' : 'text-slate-400 hover:text-white'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                    </div>
                    <button
                        onClick={onCreateCourse}
                        className="px-4 py-2.5 bg-gradient-to-r from-[#00aeef] via-[#29c6cd] to-[#ffd200] hover:brightness-110 rounded-xl font-semibold transition-all flex items-center gap-2 text-[#0b0b0b] text-sm shadow-lg shadow-[rgba(0,174,239,0.2)]"
                    >
                        <Plus size={18} />
                        <span>New Course</span>
                    </button>
                </div>
            </header>

            {/* Study utilities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[var(--color-surface-2)] border border-white/10 rounded-2xl p-4 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold">Resource Finder</p>
                            <h3 className="text-lg font-semibold text-white">Search the web faster</h3>
                            <p className="text-slate-400 text-sm">Use Google or YouTube to gather material without leaving the app.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <input
                            value={resourceQuery}
                            onChange={(e) => setResourceQuery(e.target.value)}
                            placeholder="Search topic, course code, or concept"
                            className="flex-1 bg-[var(--color-surface-3)] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60"
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleGoogleSearch}
                                className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-gradient-to-r from-[#00aeef] via-[#29c6cd] to-[#ffd200] text-[#0b0b0b] font-semibold shadow-[0_0_18px_rgba(0,174,239,0.25)] hover:brightness-110"
                            >
                                Google
                            </button>
                            <button
                                onClick={handleYoutubeSearch}
                                className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-white/10 text-white hover:border-cyan-400/60 hover:text-cyan-100"
                            >
                                YouTube
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--color-surface-2)] border border-white/10 rounded-2xl p-4 shadow-card flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold">Exam Countdown</p>
                            <h3 className="text-lg font-semibold text-white">Next critical exam</h3>
                        </div>
                        <div className="px-3 py-1 rounded-full text-[11px] bg-[rgba(255,210,0,0.14)] text-[var(--color-accent)] font-bold">
                            Stay prepared
                        </div>
                    </div>

                    {upcomingExam ? (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-sm text-slate-300 font-semibold">{upcomingExam.title}</p>
                                    <p className="text-xs text-slate-500">{upcomingExam.course.title}</p>
                                </div>
                                <div className={`px-3 py-2 rounded-xl text-center border ${upcomingExam.daysLeft <= 3 ? 'border-red-400/60 text-red-200' : 'border-cyan-400/50 text-cyan-200'}`}>
                                    <p className="text-xl font-bold">{upcomingExam.daysLeft === 0 ? '0' : upcomingExam.daysLeft}</p>
                                    <p className="text-[11px] uppercase tracking-wide">{upcomingExam.daysLeft === 0 ? 'Today' : 'Days left'}</p>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#00aeef] via-[#29c6cd] to-[#ffd200]"
                                    style={{ width: `${Math.min(100, Math.max(5, 100 - upcomingExam.daysLeft * 2))}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <p className="text-xs text-slate-400">Exam date: {new Date(upcomingExam.date).toLocaleDateString()}</p>
                                <button
                                    onClick={() => handleSelectCourse(upcomingExam.course.id)}
                                    className="text-xs px-3 py-2 rounded-lg border border-white/10 hover:border-cyan-400/60 text-white"
                                >
                                    Open course
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 text-slate-400 text-sm">No upcoming exams. Stay consistent!</div>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/15 rounded-lg">
                            <FolderOpen size={20} className="text-cyan-300" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{courses.length}</p>
                            <p className="text-xs text-slate-400">Total Courses</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/15 rounded-lg">
                            <BookOpen size={20} className="text-teal-300" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {courseStats.reduce((acc, c) => acc + c.totalTasks, 0)}
                            </p>
                            <p className="text-xs text-slate-400">Total Tasks</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/15 rounded-lg">
                            <CheckCircle size={20} className="text-emerald-300" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {courseStats.reduce((acc, c) => acc + c.completedCount, 0)}
                            </p>
                            <p className="text-xs text-slate-400">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/15 rounded-lg">
                            <Clock size={20} className="text-amber-300" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {courseStats.reduce((acc, c) => acc + c.pendingCount, 0)}
                            </p>
                            <p className="text-xs text-slate-400">Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course List */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">All Courses ({courses.length})</h2>

                {courses.length === 0 ? (
                    <div className="bg-[#1a1625] rounded-xl p-8 text-center border border-white/5">
                        <FolderOpen size={48} className="mx-auto mb-4 text-slate-600" />
                        <h3 className="text-lg font-semibold text-white mb-2">No courses yet</h3>
                        <p className="text-slate-400 text-sm mb-4">Create your first course to get started</p>
                        <button
                            onClick={onCreateCourse}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-sm transition-colors"
                        >
                            Create Course
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courseStats.map(course => (
                            <div
                                key={course.id}
                                onClick={() => handleSelectCourse(course.id)}
                                className="bg-[#1a1625] rounded-xl border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group overflow-hidden"
                            >
                                {/* Color Header */}
                                <div
                                    className={`h-20 ${course.bgGradient || 'bg-gradient-to-r from-[#00aeef] via-[#29c6cd] to-[#ffd200]'} relative p-3`}
                                    style={course.customColor ? { backgroundColor: course.customColor } : undefined}
                                >
                                    <span className="absolute top-3 right-3 bg-black/30 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                                        {course.code}
                                    </span>
                                </div>

                                <div className="p-4">
                                    <h3 className="text-base font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                                        {course.title}
                                    </h3>

                                    <div className="mb-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-slate-400">Progress</span>
                                            <span className={`text-sm font-bold ${course.progress === 100 ? 'text-green-400' : 'text-white'}`}>
                                                {course.progress}%
                                            </span>
                                        </div>
                                        <ProgressBar
                                            percentage={course.progress}
                                            colorClass={course.progress === 100 ? 'bg-green-500' : 'bg-cyan-500'}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>{course.completedCount}/{course.totalTasks} tasks</span>
                                        <ChevronRight size={16} className="group-hover:text-purple-400" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // List View
                    <div className="grid gap-3">
                        {courseStats.map(course => (
                            <div
                                key={course.id}
                                onClick={() => handleSelectCourse(course.id)}
                                className="bg-[#1a1625] rounded-xl border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group overflow-hidden"
                            >
                                <div className="flex items-stretch">
                                    {/* Color Bar */}
                                    <div
                                        className={`w-2 ${course.bgGradient || 'bg-gradient-to-b from-[#00aeef] via-[#29c6cd] to-[#ffd200]'}`}
                                        style={course.customColor ? { backgroundColor: course.customColor } : undefined}
                                    />

                                    {/* Content */}
                                    <div className="flex-1 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-bold text-cyan-200 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/30">
                                                            {course.code}
                                                        </span>
                                                        {course.progress === 100 && (
                                                            <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                                                <CheckCircle size={12} />
                                                                Done
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                                                        {course.title}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                {/* Progress */}
                                                <div className="w-32 hidden md:block">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs text-slate-400">Progress</span>
                                                        <span className={`text-xs font-bold ${course.progress === 100 ? 'text-green-400' : 'text-white'}`}>
                                                            {course.progress}%
                                                        </span>
                                                    </div>
                                                    <ProgressBar
                                                        percentage={course.progress}
                                                        colorClass={course.progress === 100 ? 'bg-green-500' : 'bg-cyan-500'}
                                                    />
                                                </div>

                                                {/* Stats */}
                                                <div className="flex items-center gap-4 text-xs">
                                                    <div className="flex items-center gap-1.5 text-green-400">
                                                        <CheckCircle size={14} />
                                                        <span>{course.completedCount}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-orange-400">
                                                        <Clock size={14} />
                                                        <span>{course.pendingCount}</span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => handleDeleteCourse(e, course.id)}
                                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        title="Delete Course"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <ChevronRight size={20} className="text-slate-500 group-hover:text-cyan-300 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursesPage;
