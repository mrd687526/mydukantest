import React from 'react';

export interface ProductDetailSectionSettings {
  product?: string;
  button_color?: string;
}

const mockProduct = {
  id: '1',
  name: 'Laptop Pro',
  price: '$999',
  description: 'A high-end laptop for professionals.',
  image: 'https://via.placeholder.com/400x300?text=Laptop+Pro',
};

const ProductDetailSection: React.FC<{ settings: ProductDetailSectionSettings }> = ({ settings }) => {
  return (
    <section className="w-full py-12 px-6 flex flex-col md:flex-row gap-8 items-center">
      <img src={mockProduct.image} alt={mockProduct.name} className="w-full md:w-1/2 rounded shadow" />
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-4">{mockProduct.name}</h1>
        <div className="text-xl text-gray-700 mb-2">{mockProduct.price}</div>
        <p className="mb-6 text-gray-600">{mockProduct.description}</p>
        <button
          className="px-6 py-3 text-white rounded font-semibold"
          style={{ background: settings.button_color || '#000000' }}
        >
          Add to Cart
        </button>
      </div>
    </section>
  );
};

export default ProductDetailSection; 