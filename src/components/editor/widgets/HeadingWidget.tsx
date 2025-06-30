"use client";

import React from "react";

export const HeadingWidget = ({
  text,
  align = "left",
  children,
}: {
  text: string;
  align?: "left" | "center" | "right";
  children?: React.ReactNode;
}) => {
  return (
    <h2 style={{ textAlign: align }} className="text-2xl font-bold">
      {text}
      {children}
    </h2>
  );
};