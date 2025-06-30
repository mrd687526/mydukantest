"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export const ButtonWidget = ({
  label,
  variant = "default",
  href,
}: {
  label: string;
  variant?: any;
  href?: string;
}) => {
  const button = <Button variant={variant}>{label}</Button>;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {button}
      </a>
    );
  }

  return button;
};