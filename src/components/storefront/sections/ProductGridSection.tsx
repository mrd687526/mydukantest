import React from 'react';

export interface ProductGridSectionSettings {
  collection?: string;
  columns?: number;
}

const mockProducts = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i + 1),
  name: `Product ${i + 1}`,
  price: `$${(i + 1) * 100}`,
  image: `https://via.placeholder.com/300x200?text=Product+${i + 1}`,
}));

const ProductGridSection: React.FC<{ settings: ProductGridSectionSettings }> = ({ settings }) => {
  const columns = settings.columns || 3;
  return (
    <section className="w-full py-12 px-6">
      <h2 className="text-2xl font-bold mb-6">Products</h2>
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-6`}>
        {mockProducts.map((product) => (
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

export default ProductGridSection; 