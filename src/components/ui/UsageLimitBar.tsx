import Progress from './Progress';

export interface UsageLimitBarProps {
  used: number;
  limit: number;
  className?: string;
}

export function UsageLimitBar({ used, limit, className }: UsageLimitBarProps) {
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  return <Progress percentage={percentage} variant="limit" className={className} />;
}
