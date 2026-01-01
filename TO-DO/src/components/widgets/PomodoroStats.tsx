import React from 'react';

const PomodoroStats = () => {
    // Mock data for now - could be connected to a pomodoro context later
    const stats = {
        focus: 65,      // 65% of time in focus
        shortBreak: 20, // 20% short breaks
        longBreak: 15,  // 15% long breaks
        totalHours: 5.4
    };

    // Calculate conic-gradient angles
    const focusEnd = stats.focus;
    const shortBreakEnd = focusEnd + stats.shortBreak;

    return (
        <div className="bg-surface p-5 rounded-2xl shadow-card">
            <h3 className="text-text-muted font-bold uppercase tracking-widest text-xs mb-5">
                Efficiency
            </h3>

            <div className="flex items-center justify-center relative w-40 h-40 mx-auto mb-4">
                {/* Donut Chart using CSS conic-gradient */}
                <div
                    className="w-full h-full rounded-full"
                    style={{
                        background: `conic-gradient(
                            #BB6BD9 0% ${focusEnd}%, 
                            #2D9CDB ${focusEnd}% ${shortBreakEnd}%, 
                            #27273F ${shortBreakEnd}% 100%
                        )`,
                        maskImage: 'radial-gradient(transparent 55%, black 56%)',
                        WebkitMaskImage: 'radial-gradient(transparent 55%, black 56%)'
                    }}
                ></div>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{stats.totalHours}h</span>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Focus Time</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-5">
                <LegendItem color="bg-secondary" label="Focus" value={`${stats.focus}%`} />
                <LegendItem color="bg-primary" label="Break" value={`${stats.shortBreak}%`} />
            </div>
        </div>
    );
};

const LegendItem = ({ color, label, value }: { color: string; label: string; value: string }) => (
    <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <span className="text-xs text-text-muted">
            {label} <span className="text-white font-semibold">{value}</span>
        </span>
    </div>
);

export default PomodoroStats;
