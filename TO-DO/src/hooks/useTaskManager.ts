import { useCallback, useMemo, useState } from 'react';

import { INITIAL_COMPLETED_TASK_IDS } from '@/data/initialData';
import { CompletionHistory } from '@/types';

import { useLocalStorage } from './useLocalStorage';

export const useTaskManager = () => {
  const [completedTaskIds, setCompletedTaskIds] = useLocalStorage<string[]>(
    'planner_completed',
    INITIAL_COMPLETED_TASK_IDS
  );
  const [completionHistory, setCompletionHistory] = useLocalStorage<CompletionHistory>(
    'planner_history',
    {}
  );
  const [history, setHistory] = useState<string[][]>([]);

  const completedTasks = useMemo(() => new Set(completedTaskIds), [completedTaskIds]);

  const toggleTask = useCallback(
    (taskId: string) => {
      setCompletedTaskIds(prev => {
        const snapshot = [...prev];
        setHistory(historyPrev => {
          const nextHistory = [...historyPrev, snapshot];
          return nextHistory.length > 20 ? nextHistory.slice(1) : nextHistory;
        });

        if (snapshot.includes(taskId)) {
          setCompletionHistory(prevHistory => {
            const { [taskId]: _removed, ...rest } = prevHistory;
            return rest;
          });
          return snapshot.filter(id => id !== taskId);
        }

        setCompletionHistory(prevHistory => ({
          ...prevHistory,
          [taskId]: new Date().toISOString()
        }));

        return [...snapshot, taskId];
      });
    },
    [setCompletedTaskIds, setCompletionHistory]
  );

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) {
        return prev;
      }
      const previousSnapshot = prev[prev.length - 1];
      setCompletedTaskIds(previousSnapshot);
      setCompletionHistory(currentHistory => {
        const nextHistory: CompletionHistory = {};
        previousSnapshot.forEach(id => {
          if (currentHistory[id]) {
            nextHistory[id] = currentHistory[id];
          }
        });
        return nextHistory;
      });
      return prev.slice(0, -1);
    });
  }, [setCompletedTaskIds, setCompletionHistory]);

  const hydrateTasks = useCallback(
    (taskIds: string[], history: CompletionHistory) => {
      setCompletedTaskIds(taskIds);
      setCompletionHistory(history);
      setHistory([]);
    },
    [setCompletedTaskIds, setCompletionHistory]
  );

  return {
    completedTasks,
    completionHistory,
    toggleTask,
    undo,
    hydrateTasks
  };
};
