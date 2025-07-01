"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TopCustomerData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface TopCustomersTableProps {
  data: TopCustomerData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export function TopCustomersTable({ data }: TopCustomersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Total Spend</TableHead>
            <TableHead>Store</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((customer, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <div>{customer.customer_name}</div>
                  <div className="text-sm text-muted-foreground">{customer.customer_email}</div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(customer.total_spend)}</TableCell>
                <TableCell><Badge variant="secondary">{customer.store_name}</Badge></TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}