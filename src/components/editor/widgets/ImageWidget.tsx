"use client";

import React from "react";

export const ImageWidget = ({
  src,
  alt,
  href,
  children,
}: {
  src: string;
  alt: string;
  href?: string;
  children?: React.ReactNode;
}) => {
  if (!src) {
    return (
      <div className="bg-gray-200 h-24 flex items-center justify-center text-gray-500 rounded">
        Image
      </div>
    );
  }

  const image = <img src={src} alt={alt} className="max-w-full rounded" />;

  if (href) {
    return (
      // In editor, prevent navigation
      <a
        href={href}
        onClick={(e) => e.preventDefault()}
        target="_blank"
        rel="noopener noreferrer"
      >
        {image}
        {children}
      </a>
    );
  }

  return (
    <div>
      {image}
      {children}
    </div>
  );
};