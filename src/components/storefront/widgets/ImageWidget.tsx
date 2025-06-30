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
  if (!src) return null;
  const image = <img src={src} alt={alt} className="max-w-full rounded" />;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {image}
      </a>
    );
  }
  return image;
};