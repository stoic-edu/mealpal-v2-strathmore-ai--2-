interface HealthRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function HealthRing({ score, size = 56, strokeWidth = 4, label }: HealthRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 90) return "text-accent";
    if (s >= 70) return "text-primary";
    if (s >= 50) return "text-chart-3";
    return "text-destructive";
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={getColor(score)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-foreground">{score}%</span>
        </div>
      </div>
      {label && <span className="text-[10px] text-muted-foreground font-medium">{label}</span>}
    </div>
  );
}