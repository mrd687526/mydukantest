"use client";

import React from "react";

export const ImageWidget = ({
  src,
  alt,
  children,
}: {
  src: string;
  alt: string;
  children?: React.ReactNode;
}) => {
  if (!src) {
    return (
      <div className="bg-gray-200 h-24 flex items-center justify-center text-gray-500 rounded">
        Image
      </div>
    );
  }
  return (
    <div>
      <img src={src} alt={alt} className="max-w-full rounded" />
      {children}
    </div>
  );
};