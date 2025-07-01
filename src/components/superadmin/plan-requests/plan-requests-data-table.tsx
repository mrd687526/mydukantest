"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlanRequest } from "@/lib/types";
import { approvePlanRequest, rejectPlanRequest } from "@/app/actions/plan-requests";

async function handleApprove(requestId: string) {
  const result = await approvePlanRequest(requestId);
  if (result.error) {
    toast.error("Failed to approve request", { description: result.error });
  } else {
    toast.success(result.message);
  }
}

async function handleReject(requestId: string) {
  const result = await rejectPlanRequest(requestId);
  if (result.error) {
    toast.error("Failed to reject request", { description: result.error });
  } else {
    toast.success(result.message);
  }
}

export const columns: ColumnDef<PlanRequest>[] = [
  {
    accessorKey: "profiles",
    header: "Tenant",
    cell: ({ row }) => {
      const profile = row.original.profiles;
      return (
        <div>
          <div className="font-medium">{profile?.name || "N/A"}</div>
          <div className="text-sm text-muted-foreground">{profile?.email || "N/A"}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "plans",
    header: "Requested Plan",
    cell: ({ row }) => {
      const plan = row.original.plans;
      return <div className="font-medium">{plan?.name || "N/A"}</div>;
    },
  },
  {
    accessorKey: "requested_at",
    header: "Date Submitted",
    cell: ({ row }) => {
      const date = new Date(row.getValue("requested_at"));
      return <div>{format(date, 'yyyy-MM-dd HH:mm')}</div>;
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => <div className="truncate max-w-xs">{row.getValue("notes") || "N/A"}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [isProcessing, setIsProcessing] = React.useState(false);
      const request = row.original;

      const onApprove = async () => {
        setIsProcessing(true);
        await handleApprove(request.id);
        setIsProcessing(false);
      };

      const onReject = async () => {
        setIsProcessing(true);
        await handleReject(request.id);
        setIsProcessing(false);
      };

      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={onApprove} disabled={isProcessing}>
            {isProcessing ? "..." : "Approve"}
          </Button>
          <Button size="sm" variant="destructive" onClick={onReject} disabled={isProcessing}>
            {isProcessing ? "..." : "Reject"}
          </Button>
        </div>
      );
    },
  },
];

export function PlanRequestsDataTable({ data }: { data: PlanRequest[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No pending requests.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}