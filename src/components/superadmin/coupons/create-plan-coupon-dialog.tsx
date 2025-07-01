"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlanCouponForm } from "./plan-coupon-form";

export function CreatePlanCouponDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Coupon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Plan Coupon</DialogTitle>
          <DialogDescription>
            Set up a new coupon code for subscription plans.
          </DialogDescription>
        </DialogHeader>
        <PlanCouponForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}