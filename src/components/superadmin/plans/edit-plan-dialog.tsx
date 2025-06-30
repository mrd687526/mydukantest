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
import { PlanForm } from "./plan-form";
import { Plan } from "@/lib/types";

interface EditPlanDialogProps {
  plan: Plan;
  isOpen: boolean;
  onClose: () => void;
}

export function EditPlanDialog({ plan, isOpen, onClose }: EditPlanDialogProps) {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Plan: {plan.name}</DialogTitle>
          <DialogDescription>
            Update the details of this subscription plan.
          </DialogDescription>
        </DialogHeader>
        <PlanForm initialData={plan} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}