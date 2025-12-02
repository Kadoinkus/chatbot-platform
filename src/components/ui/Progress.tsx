interface ProgressProps {
  percentage: number;
  className?: string;
}

export default function Progress({ percentage, className = '' }: ProgressProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`w-full relative ${className}`}>
      {/* Progress bar container */}
      <div className="w-full bg-background-tertiary rounded-full h-2 overflow-hidden relative">
        {/* Layer 1: Full gradient background */}
        <div
          className="absolute inset-0 h-2 rounded-full"
          style={{
            background: 'linear-gradient(to right, #22c55e 0%, #eab308 70%, #ef4444 100%)'
          }}
        />

        {/* Layer 2: Overlay that hides gradient from percentage to 100% */}
        <div
          className="absolute inset-0 h-2 rounded-full bg-background-tertiary transition-all duration-500 ease-out"
          style={{
            left: `${clampedPercentage}%`
          }}
        />
      </div>

      {/* Cap element - slider toggle style */}
      {clampedPercentage > 0 && (
        <div
          className="absolute top-1/2 w-3 h-3 rounded-full transition-all duration-500 ease-out z-10 bg-background-tertiary border border-border-secondary"
          style={{
            left: `${clampedPercentage}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1)'
          }}
        />
      )}
    </div>
  );
}
