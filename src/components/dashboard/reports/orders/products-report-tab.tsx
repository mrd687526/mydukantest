"use client";

import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TopSellingProductReportData } from "@/lib/types";

interface ProductsReportTabProps {
  products: TopSellingProductReportData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export function ProductsReportTab({ products }: ProductsReportTabProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Quantity Sold</TableHead>
            <TableHead className="text-right">Total Sales</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products && products.length > 0 ? (
            products.map((product) => (
              <TableRow key={product.product_id}>
                <TableCell className="font-medium flex items-center gap-2">
                  {product.product_image_url ? (
                    <Image src={product.product_image_url} alt={product.product_name} width={40} height={40} className="rounded-md object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-md text-muted-foreground text-xs text-center">No Image</div>
                  )}
                  {product.product_name}
                </TableCell>
                <TableCell className="text-right">{product.total_quantity_sold}</TableCell>
                <TableCell className="text-right">{formatCurrency(product.total_sales_amount)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No top selling products found for the selected period.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}