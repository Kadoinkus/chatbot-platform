'use client';

import { Filter } from 'lucide-react';
import { Card, Button } from '@/components/ui';

export function CustomTab() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="text-center py-12 sm:py-16">
          <Filter size={48} className="mx-auto mb-4 text-foreground-tertiary" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Custom Metrics</h3>
          <p className="text-foreground-secondary max-w-md mx-auto mb-6 px-4">
            Create custom analytics dashboards tailored to your business needs.
            Track specific KPIs, set up custom filters, and build personalized reports.
          </p>
          <Button variant="secondary" disabled>
            <Filter size={16} />
            Create Custom Metric
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default CustomTab;
