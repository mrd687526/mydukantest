"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export const ButtonWidget = ({
  id,
  label,
  variant = "default",
  href,
  children,
}: {
  id: string;
  label: string;
  variant?: any;
  href?: string;
  children?: React.ReactNode;
}) => {
  const button = <Button variant={variant}>{label}</Button>;

  if (href) {
    return (
      // In editor, prevent navigation
      <a
        href={href}
        onClick={(e) => e.preventDefault()}
        target="_blank"
        rel="noopener noreferrer"
      >
        {button}
        {children}
      </a>
    );
  }

  return (
    <div>
      {button}
      {children}
    </div>
  );
};