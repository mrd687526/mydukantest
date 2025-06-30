"use client";

import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cva } from "class-variance-authority";

export const ButtonWidget = ({
  label,
  variant = "default",
  href,
  children,
}: {
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