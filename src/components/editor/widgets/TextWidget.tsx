"use client";

import React from "react";

export const TextWidget = ({
  content,
  align = "left",
  fontSize = 16,
  children,
}: {
  content: string;
  align?: "left" | "center" | "right";
  fontSize?: number;
  children?: React.ReactNode;
}) => {
  const style: React.CSSProperties = {
    textAlign: align,
    fontSize: fontSize ? `${fontSize}px` : undefined,
  };
  return (
    <p style={style}>
      {content}
      {children}
    </p>
  );
};