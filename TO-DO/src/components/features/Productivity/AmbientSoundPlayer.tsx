import { Headphones, Pause, Play } from 'lucide-react';

import { useAudio } from '@/hooks/useAudio';

export const AmbientSoundPlayer = () => {
    const { isPlaying, toggle } = useAudio();

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl text-white shadow-lg w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Headphones size={20} />
                </div>
                <div>
                    <p className="text-sm font-bold">Focus Sound</p>
                    <p className="text-xs text-indigo-100 opacity-80">Natural Noise</p>
                </div>
            </div>
            <button onClick={toggle} className="p-3 bg-white text-indigo-600 rounded-full hover:scale-110 transition-transform shadow-md">
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>
        </div>
    );
};
