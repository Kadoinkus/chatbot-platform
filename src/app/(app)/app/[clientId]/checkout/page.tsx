'use client';
import { useState, useEffect } from 'react';
import { getClientById } from '@/lib/dataService';
import { useCart } from '@/contexts/CartContext';
import Sidebar from '@/components/Sidebar';
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
    return <div className="p-6">Loading...</div>;
  }

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar clientId={client.id} />
        
        <main className="flex-1 lg:ml-16">
          <div className="container max-w-4xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
            <div className="text-center py-12">
              <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some bot templates from the marketplace to get started</p>
              <Link 
                href={`/app/${client.id}/marketplace`}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </main>
      </div>
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-6xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <Link 
            href={`/app/${client.id}/marketplace`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} />
            Back to marketplace
          </Link>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your purchase of {totalItems} item{totalItems !== 1 ? 's' : ''}</p>
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center gap-3 ${
                      isActive ? 'text-black' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        isActive ? 'border-black bg-black text-white' : 
                        isCompleted ? 'border-green-600 bg-green-600 text-white' : 
                        'border-gray-300'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <span className="font-medium hidden sm:block">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-200'
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
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6">
                  {currentStep === 'cart' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Review Your Items</h2>
                      
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium mb-1">{item.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                              {item.category && (
                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {item.category}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-100 rounded"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {typeof item.price === 'number' ? `$${(item.price * item.quantity).toFixed(2)}` : 'Free'}
                              </p>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:text-red-700 mt-1"
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
                          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                          disabled={items.length === 0}
                        >
                          Continue to Billing
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStep === 'billing' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Choose Billing Method</h2>
                      
                      <div className="space-y-4">
                        <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          billingMethod === 'subscription' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
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
                            <Calendar size={20} />
                            <div>
                              <p className="font-medium">Monthly Subscription</p>
                              <p className="text-sm text-gray-600">Recurring billing, cancel anytime</p>
                            </div>
                          </div>
                        </label>
                        
                        <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          billingMethod === 'credits' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
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
                            <Wallet size={20} />
                            <div>
                              <p className="font-medium">Use Prepaid Credits</p>
                              <p className="text-sm text-gray-600">Deduct from your balance ($2,450.00 available)</p>
                            </div>
                          </div>
                        </label>
                        
                        <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          billingMethod === 'one-time' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
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
                            <CreditCard size={20} />
                            <div>
                              <p className="font-medium">One-time Payment</p>
                              <p className="text-sm text-gray-600">Single purchase, no recurring charges</p>
                            </div>
                          </div>
                        </label>
                      </div>
                      
                      <div className="flex justify-between">
                        <button
                          onClick={() => setCurrentStep('cart')}
                          className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setCurrentStep('payment')}
                          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStep === 'payment' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Payment Information</h2>
                      
                      {billingMethod === 'credits' ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={20} className="text-green-600" />
                            <p className="font-medium text-green-900">Using Prepaid Credits</p>
                          </div>
                          <p className="text-sm text-green-700">
                            ${totalPrice.toFixed(2)} will be deducted from your balance
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            Remaining balance: ${(2450.00 - totalPrice).toFixed(2)}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Payment Method</label>
                            <div className="space-y-2">
                              <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer ${
                                paymentMethod === 'card-4242' ? 'border-black bg-gray-50' : 'border-gray-200'
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
                                  <div className="w-12 h-8 bg-gray-200 rounded" />
                                  <div>
                                    <p className="font-medium">•••• •••• •••• 4242</p>
                                    <p className="text-sm text-gray-600">Expires 12/25</p>
                                  </div>
                                </div>
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Default</span>
                              </label>
                              
                              <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600">
                                + Add New Payment Method
                              </button>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Shield size={18} className="text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-900">Secure Payment</p>
                                <p className="text-sm text-blue-700">Your payment information is encrypted and secure</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <button
                          onClick={() => setCurrentStep('billing')}
                          className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          Back
                        </button>
                        <button
                          onClick={handlePlaceOrder}
                          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                        >
                          Place Order - ${totalPrice.toFixed(2)}
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStep === 'confirmation' && (
                    <div className="text-center space-y-6 py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={32} className="text-green-600" />
                      </div>
                      
                      <div>
                        <h2 className="text-2xl font-semibold mb-2">Order Confirmed!</h2>
                        <p className="text-gray-600">Your bot templates are being set up and will be ready shortly.</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-medium mb-4">What's Next?</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-black rounded-full" />
                            <span>Your bots will appear in your dashboard within 5 minutes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-black rounded-full" />
                            <span>Customize your bot's appearance in the Mascot Studio</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-black rounded-full" />
                            <span>Configure personality and knowledge in Brain Studio</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-black rounded-full" />
                            <span>Deploy to your website or integrate via API</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 justify-center">
                        <Link
                          href={`/app/${client.id}`}
                          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                        >
                          View My Bots
                        </Link>
                        <Link
                          href={`/app/${client.id}/marketplace`}
                          className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
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
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate pr-2">{item.name} x{item.quantity}</span>
                      <span className="font-medium">
                        {typeof item.price === 'number' ? `$${(item.price * item.quantity).toFixed(2)}` : 'Free'}
                      </span>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-sm text-gray-600">
                      +{items.length - 3} more items
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  {billingMethod === 'subscription' && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>First month discount (20%)</span>
                      <span>-${(totalPrice * 0.2).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>
                      ${billingMethod === 'subscription' 
                        ? (totalPrice * 0.8).toFixed(2) 
                        : totalPrice.toFixed(2)}
                    </span>
                  </div>
                  {billingMethod === 'subscription' && (
                    <p className="text-xs text-gray-600">
                      Then ${totalPrice.toFixed(2)}/month
                    </p>
                  )}
                </div>

                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Star size={16} className="text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">30-Day Money Back</p>
                      <p className="text-xs text-yellow-700">Not satisfied? Get a full refund within 30 days.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}