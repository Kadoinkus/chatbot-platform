'use client';
import { useCart } from '@/contexts/CartContext';
import { X, ShoppingCart, Minus, Plus, Trash2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CartDrawer() {
  const { 
    isOpen, 
    setCartOpen, 
    items, 
    totalItems, 
    totalPrice, 
    updateQuantity, 
    removeItem 
  } = useCart();
  
  const params = useParams();
  const clientId = params.clientId as string;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:inset-y-0 lg:right-0 lg:left-auto lg:w-96">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
        onClick={() => setCartOpen(false)}
      />
      
      {/* Drawer */}
      <div className="relative h-full w-full lg:w-96 bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <h2 className="text-lg font-semibold">
              Cart ({totalItems})
            </h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center">
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-4">Add some bot templates to get started</p>
              <Link
                href={`/app/${clientId}/marketplace`}
                onClick={() => setCartOpen(false)}
                className="inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-gray-600 truncate">{item.category}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {typeof item.price === 'number' 
                            ? `$${(item.price * item.quantity).toFixed(2)}` 
                            : 'Free'
                          }
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:bg-gray-100 rounded text-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
            </div>
            
            <Link
              href={`/app/${clientId}/checkout`}
              onClick={() => setCartOpen(false)}
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors"
            >
              <CreditCard size={18} />
              Checkout
            </Link>
            
            <Link
              href={`/app/${clientId}/marketplace`}
              onClick={() => setCartOpen(false)}
              className="w-full text-center py-2 text-gray-600 hover:text-gray-900 text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}