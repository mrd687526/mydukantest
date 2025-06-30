"use client";

import React from "react";

export const HeadingWidget = ({
  text,
  align = "left",
  fontSize = 24,
  children,
}: {
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