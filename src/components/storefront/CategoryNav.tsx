"use client";
import React from "react";

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryNav({ categories, selectedCategory, onSelect }: CategoryNavProps) {
  return (
    <nav className="flex flex-wrap gap-2 justify-center mb-8">
      <button
        className={`px-4 py-2 rounded-full text-sm font-medium transition border ${!selectedCategory ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-blue-100"}`}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`px-4 py-2 rounded-full text-sm font-medium transition border ${selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-blue-100"}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
} 