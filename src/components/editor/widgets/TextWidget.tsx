"use client";

import React from "react";

export const TextWidget = ({
  content,
  children,
}: {
  content: string;
  children?: React.ReactNode;
}) => {
  return (
    <p>
      {content}
      {children}
    </p>
  );
};