import React from 'react';
import { usePlannerContext } from '@/context/AppContext';

const ExamTracker = () => {
    const { courses } = usePlannerContext();

    // Calculate upcoming exams from real data
    const upcomingExams = courses
        .flatMap(course =>
            (course.exams || []).map(exam => ({
                ...exam,
                courseName: course.title || course.code,
                courseColor: course.color,
                daysLeft: Math.ceil((new Date(exam.date).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 3600 * 24))
            }))
        )
        .filter(exam => exam.daysLeft >= 0 && exam.daysLeft <= 30)
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 4);

    return (
        <div className="bg-surface p-5 rounded-2xl shadow-card">
            <h3 className="text-text-muted font-bold uppercase tracking-widest text-xs mb-5">
                Upcoming Exams
            </h3>

            {upcomingExams.length > 0 ? (
                <div className="space-y-4">
                    {upcomingExams.map((exam, index) => {
                        // Calculate bar width based on urgency (inverse: closer = fuller)
                        const urgency = Math.max(0, Math.min(100, 100 - (exam.daysLeft * 3)));
                        const isUrgent = exam.daysLeft <= 3;

                        return (
                            <div key={exam.id || index} className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-accent animate-pulse' : 'bg-primary'}`}></div>
                                        <span className="font-medium text-sm text-white truncate max-w-[120px]">{exam.title}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-pill font-semibold ${isUrgent
                                            ? 'bg-accent/20 text-accent'
                                            : 'bg-surfaceLight text-text-muted'
                                        }`}>
                                        {exam.daysLeft === 0 ? 'TODAY' : `${exam.daysLeft}d`}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-[#2B2B40] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isUrgent
                                                ? 'bg-gradient-to-r from-accent to-accent/50'
                                                : 'bg-gradient-to-r from-primary to-primary/50'
                                            }`}
                                        style={{ width: `${urgency}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-text-muted mt-1">{exam.courseName}</p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-6 text-text-muted text-sm">
                    No upcoming exams 🎉
                </div>
            )}
        </div>
    );
};

export default ExamTracker;
