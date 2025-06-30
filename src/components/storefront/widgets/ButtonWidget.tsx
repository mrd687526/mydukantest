"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export const ButtonWidget = ({ label }: { label: string }) => {
  // In a real app, you'd add an onClick handler based on props
  return <Button variant="default">{label}</Button>;
};