"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FlashSaleForm } from "./flash-sale-form";
import { FlashSale } from "@/lib/types";

interface EditFlashSaleDialogProps {
  flashSale: FlashSale;
  isOpen: boolean;
  onClose: () => void;
}

export function EditFlashSaleDialog({ flashSale, isOpen, onClose }: EditFlashSaleDialogProps) {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Flash Sale: {flashSale.name}</DialogTitle>
          <DialogDescription>
            Update the details of this limited-time promotion.
          </DialogDescription>
        </DialogHeader>
        <FlashSaleForm initialData={flashSale} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}