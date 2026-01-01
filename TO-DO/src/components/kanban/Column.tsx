import React, { useMemo } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';

interface ColumnProps {
    id: string;
    title: string;
    tasks: Task[];
    color: string; // Header dot color class
    courses: any[];
    onOpenTask: (task: Task) => void;
}

export const Column = ({ id, title, tasks, color, courses, onOpenTask }: ColumnProps) => {
    const {
        setNodeRef,
    } = useSortable({
        id: id,
        data: {
            type: 'Column',
            id,
        },
        disabled: true,
    });

    const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col h-full bg-transparent min-w-[280px] w-full"
        >
            {/* Column Header */}
            <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${color} shadow-glow-sm`}></div>
                    <h3 className="text-text-muted font-bold uppercase tracking-widest text-xs">
                        {title}
                        <span className="ml-2 text-white bg-surfaceLight px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            {tasks.length}
                        </span>
                    </h3>
                </div>
                <button className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors">
                    <Plus size={14} />
                </button>
            </div>

            {/* Task List */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar pb-10">
                <SortableContext items={taskIds}>
                    {tasks.map((task) => {
                        // Find course info for color
                        const taskCourse = courses.find((c: any) =>
                            c.units.some((u: any) => u.tasks.some((t: any) => t.id === task.id))
                        );

                        return (
                            <TaskCard
                                key={task.id}
                                task={task}
                                courseColor={taskCourse?.color || 'bg-primary'}
                                courseName={taskCourse?.title || taskCourse?.code || 'General'}
                                onOpenDetails={onOpenTask}
                            />
                        );
                    })}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center text-text-muted text-xs hover:border-primary/30 transition-colors">
                        Drop tasks here
                    </div>
                )}
            </div>
        </div>
    );
};
