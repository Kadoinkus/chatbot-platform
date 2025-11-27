'use client';
import { useState, useEffect } from 'react';
import { getClientById } from '@/lib/dataService';
import { useCart } from '@/contexts/CartContext';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import {
  ArrowLeft, ShoppingCart, CreditCard, CheckCircle,
  Minus, Plus, Trash2, Package, Wallet, Calendar,
  Shield, AlertCircle, Star, Edit2
} from 'lucide-react';
import Link from 'next/link';
import type { Client } from '@/lib/dataService';

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
        <main className="flex-1 lg:ml-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
        </main>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen bg-background">
        <main className="flex-1 lg:ml-16 flex items-center justify-center">
          <p className="text-foreground-secondary">Client not found</p>
        </main>
      </div>
    );
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <AuthGuard clientId={params.clientId}>
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={client.id} />

        <main className="flex-1 lg:ml-16">
          <div className="container max-w-4xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
            <div className="text-center py-12">
              <ShoppingCart size={64} className="mx-auto text-foreground-tertiary mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
              <p className="text-foreground-secondary mb-6">Add some bot templates from the marketplace to get started</p>
              <Link
                href={`/app/${client.id}/marketplace`}
                className="btn-primary px-6 py-3"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </main>
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

      <main className="flex-1 lg:ml-16">
        <div className="container max-w-6xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <Link
            href={`/app/${client.id}/marketplace`}
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground mb-6"
          >
            <ArrowLeft size={16} />
            Back to marketplace
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
            <p className="text-foreground-secondary">Complete your purchase of {totalItems} item{totalItems !== 1 ? 's' : ''}</p>
          </div>

          {/* Progress Steps */}
          <div className="card p-6 mb-6">
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="p-6">
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
                        <button
                          onClick={() => setCurrentStep('billing')}
                          className="btn-primary px-6 py-2"
                          disabled={items.length === 0}
                        >
                          Continue to Billing
                        </button>
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
                        <button
                          onClick={() => setCurrentStep('cart')}
                          className="btn-secondary px-6 py-2"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setCurrentStep('payment')}
                          className="btn-primary px-6 py-2"
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStep === 'payment' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground">Payment Information</h2>

                      {billingMethod === 'credits' ? (
                        <div className="p-4 bg-success-100 dark:bg-success-700/30 border border-success-300 dark:border-success-700 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={20} className="text-success-600 dark:text-success-500" />
                            <p className="font-medium text-success-900 dark:text-success-300">Using Prepaid Credits</p>
                          </div>
                          <p className="text-sm text-success-700 dark:text-success-400">
                            ${totalPrice.toFixed(2)} will be deducted from your balance
                          </p>
                          <p className="text-sm text-success-600 dark:text-success-500 mt-1">
                            Remaining balance: ${(2450.00 - totalPrice).toFixed(2)}
                          </p>
                        </div>
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

                          <div className="p-4 bg-info-100 dark:bg-info-700/30 border border-info-300 dark:border-info-700 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Shield size={18} className="text-info-600 dark:text-info-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-info-900 dark:text-info-300">Secure Payment</p>
                                <p className="text-sm text-info-700 dark:text-info-400">Your payment information is encrypted and secure</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <button
                          onClick={() => setCurrentStep('billing')}
                          className="btn-secondary px-6 py-2"
                        >
                          Back
                        </button>
                        <button
                          onClick={handlePlaceOrder}
                          className="btn-primary px-6 py-2"
                        >
                          Place Order - ${totalPrice.toFixed(2)}
                        </button>
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
                        <div className="space-y-3 text-sm text-foreground-secondary">
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
                        <Link
                          href={`/app/${client.id}`}
                          className="btn-primary px-6 py-2"
                        >
                          View My Bots
                        </Link>
                        <Link
                          href={`/app/${client.id}/marketplace`}
                          className="btn-secondary px-6 py-2"
                        >
                          Browse More Templates
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-6">
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

                <div className="mt-6 p-3 bg-warning-100 dark:bg-warning-700/30 border border-warning-300 dark:border-warning-700 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Star size={16} className="text-warning-600 dark:text-warning-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning-900 dark:text-warning-300">30-Day Money Back</p>
                      <p className="text-xs text-warning-700 dark:text-warning-400">Not satisfied? Get a full refund within 30 days.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}