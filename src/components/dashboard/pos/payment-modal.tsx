"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

interface PaymentModalProps {
  totalAmount: number;
  onProcessPayment: (paymentType: string, amountTendered?: number) => void;
  onBack: () => void;
}

export function PaymentModal({ totalAmount, onProcessPayment, onBack }: PaymentModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card_terminal' | null>(null);
  const [amountTendered, setAmountTendered] = useState<number | ''>(totalAmount);

  const changeDue = typeof amountTendered === 'number' ? amountTendered - totalAmount : 0;

  const handleAmountTenderedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmountTendered(isNaN(value) ? '' : value);
  };

  const handleCompleteSale = () => {
    if (selectedPaymentMethod === 'cash' && (typeof amountTendered !== 'number' || amountTendered < totalAmount)) {
      alert("Amount tendered must be greater than or equal to total amount.");
      return;
    }
    if (selectedPaymentMethod) {
      onProcessPayment(selectedPaymentMethod, typeof amountTendered === 'number' ? amountTendered : undefined);
    } else {
      alert("Please select a payment method.");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onBack}>
      <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-3xl">Process Payment</DialogTitle>
          <DialogDescription className="text-lg">
            Total Amount Due: <span className="font-bold text-primary text-3xl">${totalAmount.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col justify-center items-center space-y-6">
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <Button
              className={`h-24 text-xl ${selectedPaymentMethod === 'cash' ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              onClick={() => setSelectedPaymentMethod('cash')}
            >
              Cash
            </Button>
            <Button
              className={`h-24 text-xl ${selectedPaymentMethod === 'card_terminal' ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              onClick={() => setSelectedPaymentMethod('card_terminal')}
            >
              Card Terminal
            </Button>
            {/* Add more payment methods here */}
          </div>

          {selectedPaymentMethod === 'cash' && (
            <div className="w-full max-w-md space-y-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="amountTendered" className="text-xl text-right">Amount Tendered:</Label>
                <Input
                  id="amountTendered"
                  type="number"
                  step="0.01"
                  value={amountTendered}
                  onChange={handleAmountTenderedChange}
                  className="text-xl p-3"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label className="text-xl text-right">Change Due:</Label>
                <span className="text-primary text-3xl font-bold">
                  ${changeDue.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-4">
          <Button variant="outline" className="py-6 text-lg" onClick={onBack}>
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Cart
          </Button>
          <Button
            className="py-6 text-xl font-bold"
            onClick={handleCompleteSale}
            disabled={!selectedPaymentMethod || (selectedPaymentMethod === 'cash' && (typeof amountTendered !== 'number' || amountTendered < totalAmount))}
          >
            Complete Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}