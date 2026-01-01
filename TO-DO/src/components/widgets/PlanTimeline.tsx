import React from 'react';
import { Clock } from 'lucide-react';

const PlanTimeline = () => {
    // Mock timeline data
    const timelineItems = [
        { time: '09:00', title: 'Morning Study Session', type: 'focus' },
        { time: '11:30', title: 'Calculus Review', type: 'task' },
        { time: '14:00', title: 'Project Meeting', type: 'meeting' },
        { time: '16:00', title: 'Physics Practice', type: 'task' },
    ];

    return (
        <div className="bg-surface p-5 rounded-2xl shadow-card flex-1">
            <h3 className="text-text-muted font-bold uppercase tracking-widest text-xs mb-5">
                Plan
            </h3>

            <div className="space-y-0">
                {timelineItems.map((item, index) => (
                    <div key={index} className="flex gap-4 group">
                        {/* Gradient Line */}
                        <div className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary shadow-glow-sm' : 'bg-text-muted/30'
                                }`}></div>
                            {index < timelineItems.length - 1 && (
                                <div className="w-0.5 h-12 bg-gradient-to-b from-primary/50 to-transparent"></div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 text-text-muted text-[10px] uppercase tracking-wider font-semibold mb-1">
                                <Clock size={10} />
                                {item.time}
                            </div>
                            <p className={`text-sm font-medium ${index === 0 ? 'text-white' : 'text-text-muted'}`}>
                                {item.title}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlanTimeline;
