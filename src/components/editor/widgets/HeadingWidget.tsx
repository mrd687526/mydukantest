"use client";

import React from "react";

export const HeadingWidget = ({
  id,
  text,
  align = "left",
  fontSize = 24,
  children,
}: {
  id: string;
  text: string;
  align?: "left" | "center" | "right";
  fontSize?: number;
  children?: React.ReactNode;
}) => {
  const style: React.CSSProperties = {
    textAlign: align,
    fontSize: fontSize ? `${fontSize}px` : undefined,
  };
  return (
    <h2 style={style} className="font-bold">
      {text}
      {children}
    </h2>
  );
};