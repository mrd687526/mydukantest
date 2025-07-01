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
import { PlanCouponForm } from "./plan-coupon-form";
import { PlanCoupon } from "@/lib/types";

interface EditPlanCouponDialogProps {
  coupon: PlanCoupon;
  isOpen: boolean;
  onClose: () => void;
}

export function EditPlanCouponDialog({ coupon, isOpen, onClose }: EditPlanCouponDialogProps) {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Plan Coupon: {coupon.code}</DialogTitle>
          <DialogDescription>
            Update the details of this subscription plan coupon.
          </DialogDescription>
        </DialogHeader>
        <PlanCouponForm initialData={coupon} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}