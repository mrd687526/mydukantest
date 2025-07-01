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
import { FlashSaleForm } from "./flash-sale-form";

export function CreateFlashSaleDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Flash Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Flash Sale</DialogTitle>
          <DialogDescription>
            Set up a new limited-time promotion for your store.
          </DialogDescription>
        </DialogHeader>
        <FlashSaleForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}