'use client';

import { Settings } from 'lucide-react';

export function CustomTab() {
  return (
    <div className="p-6 sm:p-12 bg-background-secondary rounded-lg border border-border text-center">
      <div className="p-4 bg-background rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Settings size={32} className="text-foreground-tertiary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Custom Metrics</h3>
      <p className="text-foreground-secondary max-w-md mx-auto">
        Custom metrics and reporting coming soon. You'll be able to track custom KPIs and create personalized dashboards.
      </p>
    </div>
  );
}

export default CustomTab;
