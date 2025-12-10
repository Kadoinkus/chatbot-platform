import { Spinner } from '@/components/ui';

export default function AnalyticsLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <Spinner size="lg" />
        <p className="text-foreground-secondary text-sm">Loading analytics...</p>
      </div>
    </div>
  );
}
