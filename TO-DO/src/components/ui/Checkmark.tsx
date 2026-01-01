import { CheckCircle, Circle } from 'lucide-react';

export const Checkmark = ({ checked }: { checked: boolean }) => (
  <div className={`relative flex items-center justify-center transition-all duration-300 ${checked ? 'scale-110' : 'scale-100'}`}>
    <div className={`absolute inset-0 rounded-full ${checked ? 'bg-green-200 dark:bg-green-900/50 animate-ping' : ''}`}></div>
    {checked ? (
      <CheckCircle size={24} className="relative z-10 text-green-500 transition-transform duration-300" />
    ) : (
      <Circle size={24} className="relative z-10 text-slate-300 hover:text-indigo-400 transition-colors duration-300" />
    )}
  </div>
);
