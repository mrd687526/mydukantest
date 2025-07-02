"use client";
import React, { useState, useMemo } from "react";
import CategoryNav from "@/components/storefront/CategoryNav";
import { StorefrontRenderEngine } from "@/components/storefront/StorefrontRenderEngine";
import { ProductCard } from "@/components/storefront/product-card";
import { Product } from "@/lib/types";

interface StorefrontHomeClientProps {
  contentTree: any;
  products: Product[];
  categories: string[];
}

const PRODUCTS_PER_PAGE = 12;

export default function StorefrontHomeClient({ contentTree, products, categories }: StorefrontHomeClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Filtering
  const filteredProducts = useMemo(() => {
    let result = products;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(s) ||
        (p.description && p.description.toLowerCase().includes(s))
      );
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (minPrice) {
      result = result.filter((p) => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= parseFloat(maxPrice));
    }
    return result;
  }, [products, search, selectedCategory, minPrice, maxPrice]);

  // Sorting
  const sortedProducts = useMemo(() => {
    let result = [...filteredProducts];
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    return sortedProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [sortedProducts, page]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [selectedCategory, minPrice, maxPrice, sortBy]);

  return (
    <>
      {/* Global Search Bar */}
      <div className="mb-4 flex justify-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="border rounded px-4 py-2 w-full max-w-xl shadow-sm"
        />
      </div>
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      {contentTree ? (
        <StorefrontRenderEngine node={contentTree} />
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">Welcome to Your Store!</h2>
          <p className="text-muted-foreground">
            No custom page content found. You can design your home page using the visual editor in the dashboard.
          </p>
        </div>
      )}
      {/* Filters and Sorting */}
      <div className="flex flex-wrap gap-4 items-end justify-between mb-6 mt-12">
        <div className="flex gap-2 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="border rounded px-2 py-1 w-24"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="border rounded px-2 py-1 w-24"
              min={0}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-center mb-8">Our Products</h1>
      {paginatedProducts && paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">No products found</h2>
          <p className="text-muted-foreground">
            It looks like there are no products in this category or filter.
          </p>
        </div>
      )}
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <button
            className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 rounded border ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100"}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
} 