import React from 'react';

export interface CartSectionSettings {
  cart_bg?: string;
}

const mockCart = [
  { id: '1', name: 'Laptop Pro', price: 999, quantity: 1 },
  { id: '2', name: 'Smartphone X', price: 699, quantity: 2 },
];

const CartSection: React.FC<{ settings: CartSectionSettings }> = ({ settings }) => {
  const total = mockCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <section
      className="w-full py-12 px-6 rounded shadow max-w-2xl mx-auto"
      style={{ background: settings.cart_bg || '#FFFFFF' }}
    >
      <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
      <ul className="mb-6">
        {mockCart.map((item) => (
          <li key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
            <span>{item.name} <span className="text-xs text-gray-500">x{item.quantity}</span></span>
            <span className="font-semibold">${item.price * item.quantity}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center text-lg font-semibold">
        <span>Total</span>
        <span>${total}</span>
      </div>
      <button className="mt-6 w-full px-6 py-3 bg-black text-white rounded font-semibold hover:bg-gray-800">Checkout</button>
    </section>
  );
};

export default CartSection; 