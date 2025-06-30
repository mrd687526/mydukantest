"use client";

import React from "react";

export const ImageWidget = ({ src, alt }: { src: string; alt: string }) => {
  if (!src) return null;
  return <img src={src} alt={alt} className="max-w-full rounded" />;
};