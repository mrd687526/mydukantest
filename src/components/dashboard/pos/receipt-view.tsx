"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, RefreshCcw } from "lucide-react";
import { CartItem } from "./pos-client";

interface ReceiptViewProps {
  orderDetails: {
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    paymentType: string;
    amountTendered?: number;
    changeDue?: number;
  };
  onNewSale: () => void;
}

export function ReceiptView({ orderDetails, onNewSale }: ReceiptViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">Sale Completed!</CardTitle>
          <p className="text-lg text-muted-foreground">Order #{orderDetails.orderNumber}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-t border-b py-4 space-y-2">
            <div className="flex justify-between text-lg">
              <span>Total Amount:</span>
              <span className="font-bold">${orderDetails.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Payment Type:</span>
              <span className="capitalize">{orderDetails.paymentType.replace('_', ' ')}</span>
            </div>
            {orderDetails.paymentType === 'cash' && (
              <>
                <div className="flex justify-between text-lg">
                  <span>Amount Tendered:</span>
                  <span>${orderDetails.amountTendered?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-primary">
                  <span>Change Due:</span>
                  <span>${orderDetails.changeDue?.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Thank you for your purchase!
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4 mt-6">
        <Button onClick={handlePrint} className="py-6 text-lg">
          <Printer className="mr-2 h-5 w-5" /> Print Receipt
        </Button>
        <Button onClick={onNewSale} variant="outline" className="py-6 text-lg">
          <RefreshCcw className="mr-2 h-5 w-5" /> New Sale
        </Button>
      </div>
    </div>
  );
}