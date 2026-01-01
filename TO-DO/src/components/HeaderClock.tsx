import { useEffect, useState } from 'react';

export const HeaderClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed top-4 right-20 z-30 hidden md:flex flex-col items-end text-slate-500 dark:text-slate-400 pointer-events-none select-none">
            <div className="text-2xl font-bold font-mono text-slate-800 dark:text-white leading-none bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs font-medium uppercase tracking-wider mt-1 opacity-80 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm px-2 py-0.5 rounded">
                {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
        </div>
    );
};
