import React, { useState } from 'react';
import Header from './Header';
import RightPanel from './RightPanel';
import Sidebar from './Sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
    activeView: string;
    onNavigate: (view: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onNewTask?: () => void;
    onSettingsClick?: () => void;
    onCalendarClick?: () => void;
    showBackupReminder?: boolean;
}

const AppLayout = ({
    children,
    activeView,
    onNavigate,
    searchQuery,
    onSearchChange,
    onNewTask,
    onSettingsClick,
    onCalendarClick,
    showBackupReminder
}: AppLayoutProps) => {
    const [rightCollapsed, setRightCollapsed] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#0f0f0f]">
            {/* Sidebar */}
            <Sidebar
                activeView={activeView}
                onNavigate={onNavigate}
                onSettingsClick={onSettingsClick || (() => { })}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#13131a]">
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
                        <Header
                            searchQuery={searchQuery}
                            onSearchChange={onSearchChange}
                            onNewTask={onNewTask}
                            onCalendarClick={onCalendarClick || (() => onNavigate('calendar'))}
                            showBackupReminder={showBackupReminder}
                        />
                        <div className="animate-fade-in">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            <RightPanel collapsed={rightCollapsed} onToggle={() => setRightCollapsed(!rightCollapsed)} />
        </div>
    );
};

export default AppLayout;
