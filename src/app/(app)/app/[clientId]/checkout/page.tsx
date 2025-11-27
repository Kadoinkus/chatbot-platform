'use client';
import { useState, useEffect } from 'react';
import { getClientById } from '@/lib/dataService';
import { useCart } from '@/contexts/CartContext';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import {
  ArrowLeft, ShoppingCart, CreditCard, CheckCircle,
  Minus, Plus, Trash2, Package, Wallet, Calendar,
  Shield, Star
} from 'lucide-react';
import Link from 'next/link';
import type { Client } from '@/lib/dataService';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Card,
  Alert,
  Spinner,
  EmptyState,
} from '@/components/ui';

type CheckoutStep = 'cart' | 'billing' | 'payment' | 'confirmation';

export default function CheckoutPage({ params }: { params: { clientId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [billingMethod, setBillingMethod] = useState<'subscription' | 'credits' | 'one-time'>('subscription');
  const [paymentMethod, setPaymentMethod] = useState('card-4242');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart
  } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        const clientData = await getClientById(params.clientId);
        setClient(clientData);
      } catch (error) {
        console.error('Error loading client:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Page className="flex items-center justify-center">
          <Spinner size="lg" />
        </Page>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen bg-background">
        <Page>
          <PageContent>
            <EmptyState
              icon={<ShoppingCart size={48} />}
              title="Client not found"
              message="The requested client could not be found."
            />
          </PageContent>
        </Page>
      </div>
    );
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <AuthGuard clientId={params.clientId}>
        <div className="flex min-h-screen bg-background">
          <Sidebar clientId={client.id} />

          <Page>
            <PageContent>
              <EmptyState
                icon={<ShoppingCart size={64} />}
                title="Your cart is empty"
                message="Add some bot templates from the marketplace to get started"
                action={
                  <Link href={`/app/${client.id}/marketplace`}>
                    <Button>Browse Marketplace</Button>
                  </Link>
                }
              />
            </PageContent>
          </Page>
        </div>
      </AuthGuard>
    );
  }

  const steps = [
    { id: 'cart', label: 'Cart Review', icon: ShoppingCart },
    { id: 'billing', label: 'Billing Method', icon: Package },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'confirmation', label: 'Confirmation', icon: CheckCircle },
  ];

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setCurrentStep('confirmation');
    clearCart();
  };

  return (
    <AuthGuard clientId={params.clientId}>
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={client.id} />

        <Page>
          <PageContent maxWidth="7xl">
            <PageHeader
              title="Checkout"
              description={`Complete your purchase of ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
              backLink={
                <Link
                  href={`/app/${client.id}/marketplace`}
                  className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground"
                >
                  <ArrowLeft size={16} />
                  Back to marketplace
                </Link>
              }
            />

            {/* Progress Steps */}
            <Card className="mb-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center gap-3 ${
                        isActive ? 'text-foreground' : isCompleted ? 'text-success-600 dark:text-success-500' : 'text-foreground-tertiary'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          isActive ? 'border-interactive bg-interactive text-foreground-inverse' :
                          isCompleted ? 'border-success-600 bg-success-600 text-white dark:border-success-500 dark:bg-success-500' :
                          'border-border'
                        }`}>
                          <Icon size={18} />
                        </div>
                        <span className="font-medium hidden sm:block">{step.label}</span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-12 h-0.5 mx-4 ${
                          isCompleted ? 'bg-success-600 dark:bg-success-500' : 'bg-border'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Card>
                  {currentStep === 'cart' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground">Review Your Items</h2>

                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground mb-1">{item.name}</h3>
                              <p className="text-sm text-foreground-secondary mb-2">{item.description}</p>
                              {item.category && (
                                <span className="inline-block px-2 py-1 bg-background-tertiary text-foreground-secondary text-xs rounded">
                                  {item.category}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-background-hover rounded text-foreground"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-foreground">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-background-hover rounded text-foreground"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                {typeof item.price === 'number' ? `$${(item.price * item.quantity).toFixed(2)}` : 'Free'}
                              </p>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-error-600 dark:text-error-500 hover:text-error-700 dark:hover:text-error-400 mt-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={() => setCurrentStep('billing')} disabled={items.length === 0}>
                          Continue to Billing
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentStep === 'billing' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground">Choose Billing Method</h2>

                      <div className="space-y-4">
                        <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          billingMethod === 'subscription' ? 'border-interactive bg-background-secondary' : 'border-border hover:border-border-secondary'
                        }`}>
                          <input
                            type="radio"
                            name="billing"
                            value="subscription"
                            checked={billingMethod === 'subscription'}
                            onChange={(e) => setBillingMethod(e.target.value as any)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <Calendar size={20} className="text-foreground" />
                            <div>
                              <p className="font-medium text-foreground">Monthly Subscription</p>
                              <p className="text-sm text-foreground-secondary">Recurring billing, cancel anytime</p>
                            </div>
                          </div>
                        </label>

                        <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          billingMethod === 'credits' ? 'border-interactive bg-background-secondary' : 'border-border hover:border-border-secondary'
                        }`}>
                          <input
                            type="radio"
                            name="billing"
                            value="credits"
                            checked={billingMethod === 'credits'}
                            onChange={(e) => setBillingMethod(e.target.value as any)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <Wallet size={20} className="text-foreground" />
                            <div>
                              <p className="font-medium text-foreground">Use Prepaid Credits</p>
                              <p className="text-sm text-foreground-secondary">Deduct from your balance ($2,450.00 available)</p>
                            </div>
                          </div>
                        </label>

                        <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          billingMethod === 'one-time' ? 'border-interactive bg-background-secondary' : 'border-border hover:border-border-secondary'
                        }`}>
                          <input
                            type="radio"
                            name="billing"
                            value="one-time"
                            checked={billingMethod === 'one-time'}
                            onChange={(e) => setBillingMethod(e.target.value as any)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <CreditCard size={20} className="text-foreground" />
                            <div>
                              <p className="font-medium text-foreground">One-time Payment</p>
                              <p className="text-sm text-foreground-secondary">Single purchase, no recurring charges</p>
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="flex justify-between">
                        <Button variant="secondary" onClick={() => setCurrentStep('cart')}>
                          Back
                        </Button>
                        <Button onClick={() => setCurrentStep('payment')}>
                          Continue to Payment
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentStep === 'payment' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground">Payment Information</h2>

                      {billingMethod === 'credits' ? (
                        <Alert variant="success">
                          <div>
                            <p className="font-medium">Using Prepaid Credits</p>
                            <p className="text-sm mt-1">
                              ${totalPrice.toFixed(2)} will be deducted from your balance.
                              Remaining balance: ${(2450.00 - totalPrice).toFixed(2)}
                            </p>
                          </div>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Payment Method</label>
                            <div className="space-y-2">
                              <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer ${
                                paymentMethod === 'card-4242' ? 'border-interactive bg-background-secondary' : 'border-border'
                              }`}>
                                <input
                                  type="radio"
                                  name="payment"
                                  value="card-4242"
                                  checked={paymentMethod === 'card-4242'}
                                  onChange={(e) => setPaymentMethod(e.target.value)}
                                  className="sr-only"
                                />
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-8 bg-background-tertiary rounded" />
                                  <div>
                                    <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                                    <p className="text-sm text-foreground-secondary">Expires 12/25</p>
                                  </div>
                                </div>
                                <span className="px-2 py-1 bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500 rounded text-xs font-medium">Default</span>
                              </label>

                              <button className="w-full p-4 border-2 border-dashed border-border rounded-lg hover:border-border-secondary text-foreground-secondary">
                                + Add New Payment Method
                              </button>
                            </div>
                          </div>

                          <Alert variant="info">
                            <div className="flex items-start gap-2">
                              <Shield size={18} className="flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">Secure Payment</p>
                                <p className="text-sm">Your payment information is encrypted and secure</p>
                              </div>
                            </div>
                          </Alert>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <Button variant="secondary" onClick={() => setCurrentStep('billing')}>
                          Back
                        </Button>
                        <Button onClick={handlePlaceOrder}>
                          Place Order - ${totalPrice.toFixed(2)}
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentStep === 'confirmation' && (
                    <div className="text-center space-y-6 py-8">
                      <div className="w-16 h-16 bg-success-100 dark:bg-success-700/30 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={32} className="text-success-600 dark:text-success-500" />
                      </div>

                      <div>
                        <h2 className="text-2xl font-semibold text-foreground mb-2">Order Confirmed!</h2>
                        <p className="text-foreground-secondary">Your bot templates are being set up and will be ready shortly.</p>
                      </div>

                      <div className="bg-background-secondary rounded-lg p-6">
                        <h3 className="font-medium text-foreground mb-4">What's Next?</h3>
                        <div className="space-y-3 text-sm text-foreground-secondary text-left">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-foreground rounded-full" />
                            <span>Your bots will appear in your dashboard within 5 minutes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-foreground rounded-full" />
                            <span>Customize your bot's appearance in the Mascot Studio</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-foreground rounded-full" />
                            <span>Configure personality and knowledge in Brain Studio</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-foreground rounded-full" />
                            <span>Deploy to your website or integrate via API</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 justify-center">
                        <Link href={`/app/${client.id}`}>
                          <Button>View My Bots</Button>
                        </Link>
                        <Link href={`/app/${client.id}/marketplace`}>
                          <Button variant="secondary">Browse More Templates</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>

                  <div className="space-y-3 mb-4">
                    {items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="truncate pr-2 text-foreground-secondary">{item.name} x{item.quantity}</span>
                        <span className="font-medium text-foreground">
                          {typeof item.price === 'number' ? `$${(item.price * item.quantity).toFixed(2)}` : 'Free'}
                        </span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-sm text-foreground-secondary">
                        +{items.length - 3} more items
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-secondary">Subtotal</span>
                      <span className="text-foreground">${totalPrice.toFixed(2)}</span>
                    </div>
                    {billingMethod === 'subscription' && (
                      <div className="flex justify-between text-sm text-success-600 dark:text-success-500">
                        <span>First month discount (20%)</span>
                        <span>-${(totalPrice * 0.2).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">
                        ${billingMethod === 'subscription'
                          ? (totalPrice * 0.8).toFixed(2)
                          : totalPrice.toFixed(2)}
                      </span>
                    </div>
                    {billingMethod === 'subscription' && (
                      <p className="text-xs text-foreground-secondary">
                        Then ${totalPrice.toFixed(2)}/month
                      </p>
                    )}
                  </div>

                  <Alert variant="warning" className="mt-6">
                    <div className="flex items-start gap-2">
                      <Star size={16} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">30-Day Money Back</p>
                        <p className="text-xs">Not satisfied? Get a full refund within 30 days.</p>
                      </div>
                    </div>
                  </Alert>
                </Card>
              </div>
            </div>
          </PageContent>
        </Page>
      </div>
    </AuthGuard>
  );
}
