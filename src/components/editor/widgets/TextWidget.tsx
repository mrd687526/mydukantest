"use client";

import React from "react";

export const TextWidget = ({
  content,
  align = "left",
  fontSize = 16,
}: {
  content: string;
  align?: "left" | "center" | "right";
  fontSize?: number;
}) => {
  const style: React.CSSProperties = {
    textAlign: align,
    fontSize: fontSize ? `${fontSize}px` : undefined,
  };
  return <p style={style}>{content}</p>;
};