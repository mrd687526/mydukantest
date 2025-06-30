"use client";

import React from "react";

export const ImageWidget = ({
  src,
  alt,
  href,
}: {
  src: string;
  alt: string;
  href?: string;
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
      <a
        href={href}
        onClick={(e) => e.preventDefault()}
        target="_blank"
        rel="noopener noreferrer"
      >
        {image}
      </a>
    );
  }
  return <div>{image}</div>;
};