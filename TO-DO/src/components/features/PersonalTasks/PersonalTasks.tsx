import React, { useState, useMemo } from 'react';
import {
    Plus, CheckCircle, Clock, Star, Calendar,
    Inbox, AlertCircle, Filter, Trash2, Edit3
} from 'lucide-react';
import { usePlannerContext } from '@/context/AppContext';

interface PersonalTask {
    id: string;
    text: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    createdAt: string;
    category?: string;
}

interface PersonalTasksProps {
    onOpenQuickAdd?: () => void;
}

export const PersonalTasks: React.FC<PersonalTasksProps> = ({ onOpenQuickAdd }) => {
    const [tasks, setTasks] = useState<PersonalTask[]>([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [showAddForm, setShowAddForm] = useState(false);

    // Add new task
    const handleAddTask = () => {
        if (!newTaskText.trim()) return;

        const newTask: PersonalTask = {
            id: `personal-${Date.now()}`,
            text: newTaskText.trim(),
            completed: false,
            priority: 'medium',
            createdAt: new Date().toISOString()
        };

        setTasks(prev => [newTask, ...prev]);
        setNewTaskText('');
        setShowAddForm(false);
    };

    // Toggle task completion
    const toggleTask = (taskId: string) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    // Delete task
    const deleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
    };

    // Toggle priority
    const togglePriority = (taskId: string) => {
        setTasks(prev => prev.map(task => {
            if (task.id !== taskId) return task;
            const priorities: PersonalTask['priority'][] = ['low', 'medium', 'high'];
            const currentIndex = priorities.indexOf(task.priority);
            const nextPriority = priorities[(currentIndex + 1) % priorities.length];
            return { ...task, priority: nextPriority };
        }));
    };

    // Filtered tasks
    const filteredTasks = useMemo(() => {
        switch (filter) {
            case 'active':
                return tasks.filter(t => !t.completed);
            case 'completed':
                return tasks.filter(t => t.completed);
            default:
                return tasks;
        }
    }, [tasks, filter]);

    // Stats
    const stats = useMemo(() => ({
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        active: tasks.filter(t => !t.completed).length,
        highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length
    }), [tasks]);

    const getPriorityColor = (priority: PersonalTask['priority']) => {
        switch (priority) {
            case 'high': return 'text-red-400 bg-red-500/20';
            case 'medium': return 'text-amber-400 bg-amber-500/20';
            case 'low': return 'text-green-400 bg-green-500/20';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Inbox className="w-7 h-7 text-purple-500" />
                        Personal Tasks
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Quick tasks and personal to-dos (separate from courses)
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold transition-all flex items-center gap-2 text-white text-sm shadow-lg shadow-purple-500/20"
                >
                    <Plus size={18} />
                    <span>Add Task</span>
                </button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1a1625] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Inbox size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                            <p className="text-xs text-slate-400">Total</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1a1625] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Clock size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.active}</p>
                            <p className="text-xs text-slate-400">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1a1625] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <CheckCircle size={20} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.completed}</p>
                            <p className="text-xs text-slate-400">Done</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1a1625] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <AlertCircle size={20} className="text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.highPriority}</p>
                            <p className="text-xs text-slate-400">High Priority</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Task Form */}
            {showAddForm && (
                <div className="bg-[#1a1625] rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                            placeholder="What needs to be done?"
                            className="flex-1 bg-[#2a2438] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                            autoFocus
                        />
                        <button
                            onClick={handleAddTask}
                            className="px-4 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => { setShowAddForm(false); setNewTaskText(''); }}
                            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400">
                    <Filter size={16} />
                    <span className="text-sm font-medium">Filter:</span>
                </div>
                {(['all', 'active', 'completed'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${filter === f
                                ? 'bg-purple-500 text-white'
                                : 'bg-[#2a2438] text-slate-300 hover:bg-[#352f42]'
                            }`}
                    >
                        {f} ({f === 'all' ? stats.total : f === 'active' ? stats.active : stats.completed})
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {filteredTasks.length === 0 ? (
                    <div className="bg-[#1a1625] rounded-xl p-12 text-center border border-white/5">
                        <Inbox size={48} className="mx-auto mb-4 text-slate-600" />
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {filter === 'all' ? 'No personal tasks yet' : `No ${filter} tasks`}
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                            {filter === 'all'
                                ? 'Add your first personal task to get started'
                                : 'Try changing the filter'}
                        </p>
                        {filter === 'all' && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-sm transition-colors"
                            >
                                Add Task
                            </button>
                        )}
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div
                            key={task.id}
                            className={`bg-[#1a1625] rounded-xl border border-white/5 hover:border-purple-500/30 transition-all group ${task.completed ? 'opacity-60' : ''
                                }`}
                        >
                            <div className="flex items-center gap-4 p-4">
                                {/* Checkbox */}
                                <button
                                    onClick={() => toggleTask(task.id)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${task.completed
                                            ? 'bg-green-500 border-green-500'
                                            : 'border-slate-500 hover:border-purple-500'
                                        }`}
                                >
                                    {task.completed && <CheckCircle size={14} className="text-white" />}
                                </button>

                                {/* Task Content */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-white font-medium ${task.completed ? 'line-through text-slate-400' : ''}`}>
                                        {task.text}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Added {new Date(task.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Priority Badge */}
                                <button
                                    onClick={() => togglePriority(task.id)}
                                    className={`px-2 py-1 rounded text-xs font-bold capitalize ${getPriorityColor(task.priority)}`}
                                    title="Click to change priority"
                                >
                                    {task.priority}
                                </button>

                                {/* Delete Button */}
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Info Box */}
            <div className="bg-[#1a1625] rounded-xl p-4 border border-white/5">
                <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Personal Tasks vs Course Tasks</h4>
                        <p className="text-xs text-slate-400">
                            This section is for quick personal to-dos. For course-related tasks,
                            go to the <span className="text-purple-400 font-medium">Courses</span> section
                            in the sidebar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalTasks;
