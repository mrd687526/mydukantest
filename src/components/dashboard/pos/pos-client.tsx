"use client";

import React, { useState, useReducer, useEffect, useCallback } from "react";
import { Product } from "@/lib/types";
import { ProductSelection } from "./product-selection";
import { CartManagement } from "./cart-management";
import { PaymentModal } from "./payment-modal";
import { ReceiptView } from "./receipt-view";
import { processPOSCheckout } from "@/app/actions/orders";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

export interface CartItem extends Product {
  quantity: number;
}

interface POSState {
  cart: CartItem[];
  currentView: 'pos' | 'payment' | 'receipt';
  lastOrderDetails: { orderId: string; orderNumber: string; totalAmount: number; paymentType: string; amountTendered?: number; changeDue?: number } | null;
}

type POSAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_VIEW'; view: POSState['currentView'] }
  | { type: 'SET_LAST_ORDER_DETAILS'; details: POSState['lastOrderDetails'] };

const posReducer = (state: POSState, action: POSAction): POSState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.cart.find(item => item.id === action.product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity > action.product.inventory_quantity) {
          toast.error(`Cannot add more than available stock for ${action.product.name}.`);
          return state;
        }
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.product.id ? { ...item, quantity: newQuantity } : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.product, quantity: 1 }],
      };
    }
    case 'UPDATE_QUANTITY': {
      const productInCart = state.cart.find(item => item.id === action.productId);
      if (!productInCart) return state; // Should not happen

      if (action.quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter(item => item.id !== action.productId),
        };
      }
      if (action.quantity > productInCart.inventory_quantity) {
        toast.error(`Cannot set quantity higher than available stock for ${productInCart.name}.`);
        return state;
      }
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.productId ? { ...item, quantity: action.quantity } : item
        ),
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.productId),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SET_VIEW':
      return { ...state, currentView: action.view };
    case 'SET_LAST_ORDER_DETAILS':
      return { ...state, lastOrderDetails: action.details };
    default:
      return state;
  }
};

export function POSClient() {
  const [state, dispatch] = useReducer(posReducer, {
    cart: [],
    currentView: 'pos',
    lastOrderDetails: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // For simplicity, no taxes/shipping/discounts in POS for now

  const handleProcessPayment = async (paymentType: string, amountTendered?: number) => {
    if (state.cart.length === 0) {
      toast.error("Cart is empty. Please add items before processing payment.");
      return;
    }

    const cartItemsForCheckout = state.cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
    }));

    const result = await processPOSCheckout({
      cartItems: cartItemsForCheckout,
      payment_type: paymentType,
      total_amount: total,
      // customer_email and customer_name can be added here if you implement customer lookup in POS
    });

    if (result.success) {
      toast.success(`Sale completed! Order #${result.orderNumber}`);
      dispatch({ type: 'SET_LAST_ORDER_DETAILS', details: {
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        totalAmount: total,
        paymentType: paymentType,
        amountTendered: amountTendered,
        changeDue: amountTendered ? amountTendered - total : undefined,
      }});
      dispatch({ type: 'CLEAR_CART' });
      dispatch({ type: 'SET_VIEW', view: 'receipt' });
    } else {
      toast.error("Failed to process sale", { description: result.error });
    }
  };

  const startNewSale = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    dispatch({ type: 'SET_LAST_ORDER_DETAILS', details: null });
    dispatch({ type: 'SET_VIEW', view: 'pos' });
    setSearchTerm(""); // Clear search on new sale
  }, []);

  useEffect(() => {
    // This effect can be used to fetch initial products or popular products
    // when the component mounts or when the search term changes.
    // For now, product fetching is handled within ProductSelection.
  }, [debouncedSearchTerm]);

  return (
    <div className="flex flex-1 overflow-hidden bg-gray-100 rounded-lg shadow-lg">
      {state.currentView === 'pos' && (
        <>
          <div className="flex-1 p-4 flex flex-col">
            <ProductSelection
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onProductSelect={(product) => dispatch({ type: 'ADD_ITEM', product })}
            />
          </div>
          <div className="w-1/3 bg-white border-l border-gray-200 flex flex-col">
            <CartManagement
              cart={state.cart}
              subtotal={subtotal}
              total={total}
              onUpdateQuantity={(productId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', productId, quantity })}
              onRemoveItem={(productId) => dispatch({ type: 'REMOVE_ITEM', productId })}
              onPay={() => dispatch({ type: 'SET_VIEW', view: 'payment' })}
            />
          </div>
        </>
      )}

      {state.currentView === 'payment' && (
        <PaymentModal
          totalAmount={total}
          onProcessPayment={handleProcessPayment}
          onBack={() => dispatch({ type: 'SET_VIEW', view: 'pos' })}
        />
      )}

      {state.currentView === 'receipt' && state.lastOrderDetails && (
        <ReceiptView
          orderDetails={state.lastOrderDetails}
          onNewSale={startNewSale}
        />
      )}
    </div>
  );
}