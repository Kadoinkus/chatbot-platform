'use client';
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export type CartItemType = 'template' | 'mascot_customization' | 'addon';

export interface CartItem {
  id: string;
  type: CartItemType;
  name: string;
  description: string;
  price: number | 'Free';
  image: string;
  category?: string;
  selectedOptions?: {
    colors?: {
      primary: string;
      accent: string;
    };
    mascot?: {
      bodyType: string;
      animationStyle: string;
      expression: string;
      accessories: string;
    };
    plan?: 'monthly' | 'yearly';
    addons?: string[];
  };
  quantity: number;
  originalData?: any;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_ITEM'; payload: CartItem }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
};

function calculateTotals(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    return sum + (price * item.quantity);
  }, 0);
  
  return { totalItems, totalPrice };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  let newItems: CartItem[];
  
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      
      const { totalItems, totalPrice } = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        isOpen: true,
      };

    case 'REMOVE_ITEM':
      newItems = state.items.filter(item => item.id !== action.payload);
      const totalsAfterRemove = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        totalItems: totalsAfterRemove.totalItems,
        totalPrice: totalsAfterRemove.totalPrice,
      };

    case 'UPDATE_QUANTITY':
      newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);
      
      const totalsAfterUpdate = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        totalItems: totalsAfterUpdate.totalItems,
        totalPrice: totalsAfterUpdate.totalPrice,
      };

    case 'UPDATE_ITEM':
      newItems = state.items.map(item =>
        item.id === action.payload.id ? action.payload : item
      );
      
      const totalsAfterItemUpdate = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        totalItems: totalsAfterItemUpdate.totalItems,
        totalPrice: totalsAfterItemUpdate.totalPrice,
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'SET_CART_OPEN':
      return {
        ...state,
        isOpen: action.payload,
      };

    case 'LOAD_CART':
      const totalsAfterLoad = calculateTotals(action.payload);
      
      return {
        ...state,
        items: action.payload,
        totalItems: totalsAfterLoad.totalItems,
        totalPrice: totalsAfterLoad.totalPrice,
      };

    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItem: (item: CartItem) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('chatbot-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatbot-cart', JSON.stringify(state.items));
  }, [state.items]);

  const contextValue: CartContextType = {
    ...state,
    addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
    removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
    updateQuantity: (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
    updateItem: (item) => dispatch({ type: 'UPDATE_ITEM', payload: item }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
    setCartOpen: (open) => dispatch({ type: 'SET_CART_OPEN', payload: open }),
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}