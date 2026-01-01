interface Props {
  percentage: number;
  colorClass: string;
  size?: number;
}

export const CircularProgress = ({ percentage, colorClass, size = 20 }: Props) => (
  <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
    <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="10"
        className="text-gray-200 dark:text-gray-700"
      />
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="10"
        strokeDasharray={251.2}
        strokeDashoffset={251.2 - (251.2 * percentage) / 100}
        strokeLinecap="round"
        className={colorClass}
      />
    </svg>
  </div>
);
