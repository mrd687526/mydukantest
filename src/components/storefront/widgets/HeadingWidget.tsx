"use client";

import React from "react";

export const HeadingWidget = ({
  text,
  align = "left",
}: {
  text: string;
  align?: "left" | "center" | "right";
}) => {
  return (
    <h2 style={{ textAlign: align }} className="text-2xl font-bold">
      {text}
    </h2>
  );
};