import React from 'react';
import { Settings, ChevronDown } from 'lucide-react';

const ProfileWidget = () => {
    return (
        <div className="bg-surface p-5 rounded-2xl shadow-card relative overflow-hidden">
            <div className="flex items-center gap-4">
                {/* Avatar with abstract gradient */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-pink flex items-center justify-center shadow-lg overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-tr from-primary/80 to-secondary/80 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">B</span>
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-bold text-base">Bugra</h3>
                    <p className="text-text-muted text-xs">Computer Engineering</p>
                </div>
                <button className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    <ChevronDown size={18} />
                </button>
            </div>
        </div>
    );
};

export default ProfileWidget;
