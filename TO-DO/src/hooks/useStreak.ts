import { useMemo } from 'react';

import { CompletionHistory } from '@/types';

export const useStreak = (completionHistory: CompletionHistory) => {
    return useMemo(() => {
        const dates = new Set(
            Object.values(completionHistory).map(date => date.split('T')[0])
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;
        let checkDate = new Date(today);

        // Check if task was completed today
        const todayStr = today.toISOString().split('T')[0];
        if (!dates.has(todayStr)) {
            // If not completed today, start from yesterday
            checkDate.setDate(checkDate.getDate() - 1);
        }

        // Count consecutive days backwards
        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (dates.has(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Number of tasks completed this week
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weeklyCount = Object.values(completionHistory).filter(date => {
            const d = new Date(date);
            return d >= weekStart;
        }).length;

        return { streak, weeklyCount, hasCompletedToday: dates.has(todayStr) };
    }, [completionHistory]);
};
