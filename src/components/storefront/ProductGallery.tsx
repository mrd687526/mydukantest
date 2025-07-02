"use client";
import React, { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  if (!images.length) return null;
  return (
    <div>
      <div className="mb-4">
        <div className="relative w-full h-64 bg-gray-100 rounded overflow-hidden group">
          <img
            src={images[selected]}
            alt={alt}
            className="w-full h-64 object-contain transition-transform duration-200 group-hover:scale-110"
            style={{ cursor: "zoom-in" }}
          />
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 justify-center">
          {images.map((img, i) => (
            <button
              key={img}
              className={`w-16 h-16 rounded border ${i === selected ? "border-blue-500" : "border-gray-200"}`}
              onClick={() => setSelected(i)}
              tabIndex={0}
              aria-label={`Show image ${i + 1}`}
            >
              <img src={img} alt={alt + " thumbnail " + (i + 1)} className="w-full h-full object-contain rounded" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 