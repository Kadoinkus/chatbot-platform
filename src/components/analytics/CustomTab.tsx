'use client';

import { Filter } from 'lucide-react';
import { Card, Button } from '@/components/ui';

interface CustomTabProps {
  showButton?: boolean;
  buttonLabel?: string;
}

/**
 * Shared placeholder for custom analytics metrics.
 * Keeps both client-level and assistant-level pages consistent.
 */
export function CustomAnalyticsTab({ showButton = false, buttonLabel = 'Create Custom Metric' }: CustomTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <div className="text-center py-12 sm:py-16">
          <Filter size={48} className="mx-auto mb-4 text-foreground-tertiary" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Custom Metrics</h3>
          <p className="text-foreground-secondary max-w-md mx-auto mb-6 px-4">
            Create bespoke analytics dashboards tailored to your business needs. Track specific KPIs, set up custom
            filters, and build personalized reports across assistants or a single assistant.
          </p>
          {showButton && (
            <Button variant="secondary" disabled>
              <Filter size={16} />
              {buttonLabel}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default CustomAnalyticsTab;
