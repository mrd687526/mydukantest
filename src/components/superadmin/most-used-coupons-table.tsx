"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MostUsedCouponData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface MostUsedCouponsTableProps {
  data: MostUsedCouponData[];
}

export function MostUsedCouponsTable({ data }: MostUsedCouponsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead className="text-right">Used Count</TableHead>
            <TableHead>Store</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((coupon, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{coupon.code}</TableCell>
                <TableCell className="text-right">{coupon.used_count}</TableCell>
                <TableCell><Badge variant="secondary">{coupon.profile_name}</Badge></TableCell>
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