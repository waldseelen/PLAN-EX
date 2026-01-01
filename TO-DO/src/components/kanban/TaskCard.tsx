import { Task } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bot, Globe, MessageSquare, MoreVertical, Paperclip, Star, Youtube } from 'lucide-react';
import React, { useState } from 'react';

// Color mapping for course colors
const COURSE_COLORS: Record<string, { bg: string; text: string; pill: string }> = {
    'bg-red-500': { bg: 'bg-red-500', text: 'text-red-500', pill: 'bg-red-500/20' },
    'bg-blue-500': { bg: 'bg-blue-500', text: 'text-blue-500', pill: 'bg-blue-500/20' },
    'bg-green-500': { bg: 'bg-green-500', text: 'text-green-500', pill: 'bg-green-500/20' },
    'bg-yellow-500': { bg: 'bg-yellow-500', text: 'text-yellow-500', pill: 'bg-yellow-500/20' },
    'bg-purple-500': { bg: 'bg-purple-500', text: 'text-purple-500', pill: 'bg-purple-500/20' },
    'bg-pink-500': { bg: 'bg-pink-500', text: 'text-pink-500', pill: 'bg-pink-500/20' },
    'bg-primary': { bg: 'bg-primary', text: 'text-primary', pill: 'bg-primary/20' },
    'bg-secondary': { bg: 'bg-secondary', text: 'text-secondary', pill: 'bg-secondary/20' },
};

interface TaskCardProps {
    task: Task;
    courseName?: string;
    courseColor?: string;
    onOpenDetails?: (task: Task) => void;
}

export const TaskCard = ({ task, courseName = "General", courseColor = "bg-primary", onOpenDetails }: TaskCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const colors = COURSE_COLORS[courseColor] || COURSE_COLORS['bg-primary'];
    const initial = courseName.charAt(0).toUpperCase();
    const progress = task.pomodoros ? Math.min(100, Math.round(((task.completedPomodoros || 0) / task.pomodoros) * 100)) : 0;

    const handleGoogleSearch = (e: React.MouseEvent) => {
        e.stopPropagation();
        const query = encodeURIComponent(task.title || task.text);
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
    };

    const handleYoutubeSearch = (e: React.MouseEvent) => {
        e.stopPropagation();
        const query = encodeURIComponent(task.title || task.text);
        window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    };

    const handleChatGPTSearch = (e: React.MouseEvent) => {
        e.stopPropagation();
        const query = encodeURIComponent(task.title || task.text);
        window.open(`https://chat.openai.com/?q=${query}`, '_blank');
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-surfaceLight/50 p-5 rounded-2xl shadow-card h-[180px] w-full border-2 border-primary/50 border-dashed"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onOpenDetails?.(task)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-surface p-5 rounded-2xl shadow-card hover:bg-surfaceLight hover:-translate-y-1 transition-all duration-200 cursor-grab group text-left relative"
        >
            {/* Hover Action Buttons */}
            {isHovered && (
                <div className="absolute -top-3 right-4 flex gap-2 z-10 animate-fade-in">
                    <button
                        onClick={handleGoogleSearch}
                        className="p-2 bg-white text-gray-800 rounded-lg shadow-lg hover:scale-110 transition-transform"
                        title="Search on Google"
                    >
                        <Globe size={16} />
                    </button>
                    <button
                        onClick={handleYoutubeSearch}
                        className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:scale-110 transition-transform"
                        title="Search on YouTube"
                    >
                        <Youtube size={16} />
                    </button>
                    <button
                        onClick={handleChatGPTSearch}
                        className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg hover:scale-110 transition-transform"
                        title="Ask ChatGPT"
                    >
                        <Bot size={16} />
                    </button>
                </div>
            )}

            {/* Header: Course Name & Menu */}
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-medium text-text-muted group-hover:text-white transition-colors">
                    {courseName}
                </span>
                <button
                    className="text-text-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical size={16} />
                </button>
            </div>

            {/* Content: Icon Circle & Title Pill */}
            <div className="flex items-center gap-3 mb-4">
                {/* Round Initial Icon */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-lg ${colors.bg}`}>
                    {initial}
                </div>
                {/* Title in Pill Shape */}
                <div className={`px-3 py-1.5 rounded-pill text-xs font-medium text-white truncate flex-1 ${colors.bg}`}>
                    {task.title || task.text}
                </div>
            </div>

            {/* Progress Bar (only for in-progress) */}
            {task.status === 'in-progress' && (
                <div className="mt-4 mb-2">
                    <div className="flex justify-between text-[10px] text-text-muted mb-1.5 font-semibold uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#2B2B40] rounded-full overflow-hidden">
                        <div
                            style={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                        ></div>
                    </div>
                </div>
            )}

            {/* Footer: Icons & Favorite */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                {/* Left: Attachment & Comment Icons */}
                <div className="flex gap-3 text-text-muted">
                    {task.hasPDF && (
                        <div className="flex items-center gap-1 hover:text-white transition-colors">
                            <Paperclip size={14} />
                            <span className="text-[10px]">1</span>
                        </div>
                    )}
                    {task.notes && (
                        <div className="flex items-center gap-1 hover:text-white transition-colors">
                            <MessageSquare size={14} />
                            <span className="text-[10px]">1</span>
                        </div>
                    )}
                </div>
                {/* Right: Favorite Star */}
                <Star
                    size={16}
                    className={`transition-colors ${task.isPriority ? 'text-accent fill-accent' : 'text-text-muted/50 group-hover:text-text-muted'}`}
                />
            </div>
        </div>
    );
};
