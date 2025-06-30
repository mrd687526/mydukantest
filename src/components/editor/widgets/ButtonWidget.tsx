"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export const ButtonWidget = ({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) => {
  return (
    <div>
      <Button variant="default">{label}</Button>
      {children}
    </div>
  );
};