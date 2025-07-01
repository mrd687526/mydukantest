"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TopSellingProductReportData, Product } from "@/lib/types";

interface TopSellingProductsListProps {
  products: (TopSellingProductReportData & { stock_status?: Product['stock_status'] })[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export function TopSellingProductsList({ products }: TopSellingProductsListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Quantity Sold</TableHead>
            <TableHead>Stock Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products && products.length > 0 ? (
            products.map((product) => (
              <TableRow key={product.product_id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/ecommerce/products/${product.product_id}/edit`} className="flex items-center gap-2 hover:underline">
                    {product.product_image_url ? (
                      <Image src={product.product_image_url} alt={product.product_name} width={40} height={40} className="rounded-md object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-md text-muted-foreground text-xs text-center">No Image</div>
                    )}
                    {product.product_name}
                  </Link>
                </TableCell>
                <TableCell>{product.category || "N/A"}</TableCell>
                <TableCell>{formatCurrency(product.total_sales_amount / product.total_quantity_sold)}</TableCell>
                <TableCell className="text-right">{product.total_quantity_sold}</TableCell>
                <TableCell>
                  {product.stock_status ? (
                    <Badge variant={product.stock_status === 'out_of_stock' ? 'destructive' : 'default'} className="capitalize">
                      {product.stock_status.replace('_', ' ')}
                    </Badge>
                  ) : (
                    <Badge variant="outline">N/A</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No top selling products found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}