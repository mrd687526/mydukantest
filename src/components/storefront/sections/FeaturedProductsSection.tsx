import React from 'react';

export interface FeaturedProductsSectionSettings {
  collection?: string;
  products?: string[];
  max_products?: number;
}

// Mock product data for demo
const mockProducts = [
  { id: '1', name: 'Laptop Pro', price: '$999', image: 'https://via.placeholder.com/300x200?text=Laptop+Pro' },
  { id: '2', name: 'Smartphone X', price: '$699', image: 'https://via.placeholder.com/300x200?text=Smartphone+X' },
  { id: '3', name: 'Wireless Earbuds', price: '$199', image: 'https://via.placeholder.com/300x200?text=Earbuds' },
  { id: '4', name: 'Smartwatch', price: '$299', image: 'https://via.placeholder.com/300x200?text=Smartwatch' },
];

const FeaturedProductsSection: React.FC<{ settings: FeaturedProductsSectionSettings }> = ({ settings }) => {
  const products = mockProducts.slice(0, settings.max_products || 4);
  return (
    <section className="w-full py-12 px-6">
      <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded shadow p-4 flex flex-col items-center">
            <img src={product.image} alt={product.name} className="w-full h-32 object-cover mb-4 rounded" />
            <div className="font-semibold text-lg mb-2">{product.name}</div>
            <div className="text-gray-700 mb-4">{product.price}</div>
            <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">Add to Cart</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProductsSection; 