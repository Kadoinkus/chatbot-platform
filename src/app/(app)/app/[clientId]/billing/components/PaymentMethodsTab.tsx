'use client';

import { CreditCard, Plus, Info, ExternalLink } from 'lucide-react';
import { Card, Button, Badge, Skeleton, EmptyState, Alert } from '@/components/ui';
import type { PaymentMethod } from '@/types/billing';

interface PaymentMethodsTabProps {
  clientId: string;
  clientSlug: string;
  paymentMethods: PaymentMethod[];
  isLoading?: boolean;
  error?: string | null;
  onAddPaymentMethod?: () => void;
  onRemovePaymentMethod?: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

/**
 * Payment Methods tab - Stripe integration placeholder
 */
export function PaymentMethodsTab({
  paymentMethods,
  isLoading = false,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onSetDefault,
}: PaymentMethodsTabProps) {
  if (isLoading) {
    return <PaymentMethodsTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header with action */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <CreditCard size={24} />
          Payment Methods
        </h2>
        <Button
          icon={<Plus size={16} />}
          onClick={onAddPaymentMethod}
          disabled
        >
          Add Payment Method
        </Button>
      </div>

      {/* Stripe Integration Notice */}
      <Alert variant="info">
        <div className="flex items-start gap-3">
          <Info size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Stripe Integration Coming Soon</p>
            <p className="text-sm mt-1 opacity-90">
              Full payment method management with Stripe will be available in a future update.
              For now, contact support to update your payment details.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              icon={<ExternalLink size={14} />}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </Alert>

      {/* Payment Methods List */}
      {paymentMethods.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={48} />}
          title="No payment methods"
          message="Add a payment method to enable automatic billing."
          action={
            <Button icon={<Plus size={16} />} disabled>
              Add Payment Method
            </Button>
          }
        />
      ) : (
        <Card>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Saved Payment Methods
          </h3>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 bg-background-secondary rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-background rounded-lg">
                    <CreditCard size={24} className="text-foreground-tertiary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {method.brand} **** {method.last4}
                      </p>
                      {method.isDefault && (
                        <Badge variant="success">Default</Badge>
                      )}
                    </div>
                    {method.expiryMonth && method.expiryYear && (
                      <p className="text-sm text-foreground-secondary">
                        Expires {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSetDefault?.(method.id)}
                      disabled
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemovePaymentMethod?.(method.id)}
                    disabled
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Future Features Preview */}
      <Card className="bg-background-secondary border-dashed">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Coming Soon
        </h3>
        <ul className="space-y-2 text-sm text-foreground-secondary">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-info-500" />
            Add and manage multiple payment methods
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-info-500" />
            Automatic payment retry for failed charges
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-info-500" />
            SEPA Direct Debit support (EU)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-info-500" />
            Invoicing preferences and tax settings
          </li>
        </ul>
      </Card>
    </div>
  );
}

/**
 * Skeleton loading state for Payment Methods tab
 */
function PaymentMethodsTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton height="1.75rem" width="200px" />
        <Skeleton height="2.5rem" width="180px" rounded="lg" />
      </div>

      {/* Info card skeleton */}
      <Card>
        <div className="flex gap-3">
          <Skeleton height="1.25rem" width="1.25rem" rounded="full" />
          <div className="flex-1">
            <Skeleton height="1.25rem" width="60%" className="mb-2" />
            <Skeleton height="1rem" width="90%" className="mb-1" />
            <Skeleton height="1rem" width="70%" />
          </div>
        </div>
      </Card>

      {/* Payment method card skeleton */}
      <Card>
        <Skeleton height="1.25rem" width="40%" className="mb-4" />
        <div className="p-4 bg-background-secondary rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton height="3rem" width="3rem" rounded="lg" />
              <div>
                <Skeleton height="1.25rem" width="150px" className="mb-2" />
                <Skeleton height="1rem" width="100px" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton height="2rem" width="80px" rounded="md" />
              <Skeleton height="2rem" width="70px" rounded="md" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default PaymentMethodsTab;
