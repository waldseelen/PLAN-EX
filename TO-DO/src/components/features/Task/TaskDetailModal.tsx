import {
    AlertCircle,
    Bot,
    Calendar,
    Check,
    Code,
    Edit2,
    FileText,
    Globe,
    ListTodo,
    Paperclip,
    Plus,
    Sigma,
    Tag,
    X,
    Youtube
} from 'lucide-react';
import { useEffect, useState } from 'react';
// import ReactMarkdown from 'react-markdown';
// import remarkMath from 'remark-math';
// import rehypeKatex from 'rehype-katex';
// import 'katex/dist/katex.min.css';

import { Task } from '@/types';

interface Props {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedTask: Task) => void;
}

export const TaskDetailModal = ({ task, isOpen, onClose, onUpdate }: Props) => {
    const [editedTask, setEditedTask] = useState<Task | null>(null);
    const [newSubtask, setNewSubtask] = useState('');
    const [newTag, setNewTag] = useState('');
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

    useEffect(() => {
        setEditedTask(task);
    }, [task]);

    if (!isOpen || !editedTask) return null;

    const handleSave = () => {
        onUpdate(editedTask);
        onClose();
    };

    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        const sub = { id: Date.now().toString(), text: newSubtask, completed: false };
        setEditedTask(prev => (prev ? { ...prev, subtasks: [...(prev.subtasks || []), sub] } : prev));
        setNewSubtask('');
    };

    const toggleSubtask = (subId: string) => {
        setEditedTask(prev =>
            prev
                ? {
                    ...prev,
                    subtasks: prev.subtasks?.map(sub =>
                        sub.id === subId ? { ...sub, completed: !sub.completed } : sub
                    )
                }
                : prev
        );
    };

    const removeSubtask = (subId: string) => {
        setEditedTask(prev =>
            prev ? { ...prev, subtasks: prev.subtasks?.filter(sub => sub.id !== subId) } : prev
        );
    };

    const addTag = () => {
        const trimmed = newTag.trim();
        if (!trimmed || editedTask.tags?.includes(trimmed)) return;
        setEditedTask(prev => (prev ? { ...prev, tags: [...(prev.tags || []), trimmed] } : prev));
        setNewTag('');
    };

    const removeTag = (tag: string) => {
        setEditedTask(prev => (prev ? { ...prev, tags: prev.tags?.filter(t => t !== tag) } : prev));
    };

    const searchGoogle = () => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(editedTask.text)}`, '_blank');
    };

    const searchYoutube = () => {
        window.open(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(editedTask.text)}`,
            '_blank'
        );
    };


    const renderRichText = (text: string) => {
        if (!text) return <p className="text-slate-400 italic">No notes...</p>;

        const parts = text.split(/(`[^`]+`|\$\$[^$]+\$\$)/g);
        return (
            <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {parts.map((part, idx) => {
                    if (part.startsWith('`') && part.endsWith('`')) {
                        return (
                            <code
                                key={idx}
                                className="bg-slate-200 dark:bg-slate-700 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded font-mono text-xs"
                            >
                                {part.slice(1, -1)}
                            </code>
                        );
                    }
                    if (part.startsWith('$$') && part.endsWith('$$')) {
                        return (
                            <span key={idx} className="font-serif italic text-lg text-indigo-700 dark:text-indigo-400 px-1">
                                {part.slice(2, -2)}
                            </span>
                        );
                    }
                    return <span key={idx}>{part}</span>;
                })}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-[#1a1625] w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#2a2438]/50 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Edit2 size={18} className="text-purple-400" />
                        Task Details
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={searchGoogle} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Search on Google">
                            <Globe size={18} />
                        </button>
                        <button onClick={searchYoutube} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Search on YouTube">
                            <Youtube size={18} />
                        </button>
                        <button onClick={() => window.open(`https://chatgpt.com/?q=${encodeURIComponent(editedTask.text)}`, '_blank')} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200" title="Ask ChatGPT">
                            <Bot size={18} />
                        </button>
                        <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                        <input
                            type="text"
                            value={editedTask.text}
                            onChange={e => setEditedTask({ ...editedTask, text: e.target.value })}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Calendar size={14} /> Due Date
                            </label>
                            <input
                                type="date"
                                value={editedTask.dueDate || ''}
                                onChange={e => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <AlertCircle size={14} /> Priority
                            </label>
                            <select
                                value={editedTask.priority || 'medium'}
                                onChange={e => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Tag size={14} /> Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {editedTask.tags?.map(tag => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs rounded-lg flex items-center gap-1"
                                >
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addTag()}
                                placeholder="Add tag..."
                                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                            />
                            <button onClick={addTag} className="px-3 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <FileText size={14} /> Smart Notes
                            </label>
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                                <button
                                    onClick={() => setActiveTab('write')}
                                    className={`px-2 py-1 text-xs rounded-md transition-all ${activeTab === 'write' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500'
                                        }`}
                                >
                                    Write
                                </button>
                                <button
                                    onClick={() => setActiveTab('preview')}
                                    className={`px-2 py-1 text-xs rounded-md transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500'
                                        }`}
                                >
                                    Preview
                                </button>
                            </div>
                        </div>

                        {activeTab === 'write' ? (
                            <div className="relative">
                                <textarea
                                    value={editedTask.notes || ''}
                                    onChange={e => setEditedTask({ ...editedTask, notes: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl h-32 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none dark:text-white font-mono"
                                    placeholder="Notes... Use `code` for code, $$E=mc^2$$ for formulas."
                                ></textarea>
                                <div className="absolute bottom-2 right-2 flex gap-1">
                                    <button
                                        className="p-1 text-slate-400 hover:text-indigo-500"
                                        title="Kod Bloğu"
                                        onClick={() => setEditedTask({ ...editedTask, notes: `${editedTask.notes || ''} \`kod\` ` })}
                                    >
                                        <Code size={14} />
                                    </button>
                                    <button
                                        className="p-1 text-slate-400 hover:text-indigo-500"
                                        title="Matematik Formülü"
                                        onClick={() => setEditedTask({ ...editedTask, notes: `${editedTask.notes || ''} $$fx$$ ` })}
                                    >
                                        <Sigma size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl h-32 overflow-y-auto">
                                {renderRichText(editedTask.notes || '')}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <ListTodo size={14} /> Subtasks
                        </label>
                        <div className="space-y-2 mb-3">
                            {editedTask.subtasks?.map(sub => (
                                <div key={sub.id} className="flex items-center gap-2 group">
                                    <button
                                        onClick={() => toggleSubtask(sub.id)}
                                        className={`w-4 h-4 rounded border flex items-center justify-center ${sub.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'
                                            }`}
                                    >
                                        {sub.completed && <Check size={12} />}
                                    </button>
                                    <span className={`flex-1 text-sm ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {sub.text}
                                    </span>
                                    <button
                                        onClick={() => removeSubtask(sub.id)}
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSubtask}
                                onChange={e => setNewSubtask(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addSubtask()}
                                placeholder="Add subtask..."
                                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                            />
                            <button onClick={addSubtask} className="px-3 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Paperclip size={14} /> Attachments (PDF)
                        </label>

                        {editedTask.pdfData ? (
                            <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Attached Document</p>
                                        <button
                                            onClick={() => {
                                                const win = window.open();
                                                win?.document.write(`<iframe src="${editedTask.pdfData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                            }}
                                            className="text-xs text-indigo-500 hover:underline"
                                        >
                                            View PDF
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditedTask({ ...editedTask, pdfData: undefined, hasPDF: false })}
                                    className="p-2 hover:bg-white/50 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors relative">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (evt) => {
                                                setEditedTask({
                                                    ...editedTask,
                                                    pdfData: evt.target?.result as string,
                                                    hasPDF: true
                                                });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <Paperclip size={24} className="mx-auto text-slate-400 mb-2" />
                                <p className="text-sm text-slate-500">Click to upload PDF</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-[#2a2438]/50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-400 font-medium hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors shadow-lg shadow-purple-500/20"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
