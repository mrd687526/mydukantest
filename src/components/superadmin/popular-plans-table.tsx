"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PopularPlanData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface PopularPlansTableProps {
  data: PopularPlanData[];
}

export function PopularPlansTable({ data }: PopularPlansTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan Name</TableHead>
            <TableHead className="text-right">Active Subscriptions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((plan, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{plan.plan_name}</TableCell>
                <TableCell className="text-right">{plan.active_subscriptions}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center">
                No data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}