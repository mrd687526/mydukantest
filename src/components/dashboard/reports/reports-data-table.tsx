"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CampaignReport } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<CampaignReport>[] = [
  {
    accessorKey: "automation_campaigns",
    header: "Campaign",
    cell: ({ row }) => {
      const campaign = row.original.automation_campaigns;
      const campaignName = campaign?.name || "N/A";
      return <div className="font-medium">{campaignName}</div>;
    },
  },
  {
    accessorKey: "action_taken",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action_taken") as string;
      return <Badge variant="outline" className="capitalize">{action}</Badge>;
    },
  },
  {
    accessorKey: "associated_keyword",
    header: "Keyword",
    cell: ({ row }) => (
      <div>{row.getValue("associated_keyword") || "N/A"}</div>
    ),
  },
  {
    accessorKey: "reply_text",
    header: "Reply",
    cell: ({ row }) => (
      <div className="truncate max-w-xs">
        {row.getValue("reply_text") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "sent_at",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("sent_at"));
      return <div className="text-sm text-muted-foreground">{format(date, 'yyyy-MM-dd HH:mm')}</div>;
    },
  },
];

export function ReportsDataTable({ data }: { data: CampaignReport[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No reports found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}