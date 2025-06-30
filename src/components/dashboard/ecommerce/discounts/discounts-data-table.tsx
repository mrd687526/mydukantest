"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Discount } from "@/lib/types";
import { deleteDiscount } from "@/app/actions/discounts";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";

async function handleDelete(discountId: string) {
  const result = await deleteDiscount(discountId);
  if (result.error) {
    toast.error("Failed to delete discount", { description: result.error });
  } else {
    toast.success(result.message);
  }
}

export const columns: ColumnDef<Discount>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium pl-4">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as Discount['type'];
      return <Badge variant="secondary" className="capitalize">{type.replace('_', ' ')}</Badge>;
    },
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("value"));
      const type = row.original.type;
      if (type === 'percentage') return `${value}%`;
      if (type === 'fixed_amount') return `$${value.toFixed(2)}`;
      return "N/A";
    },
  },
  {
    accessorKey: "min_purchase_amount",
    header: "Min. Purchase",
    cell: ({ row }) => {
      const amount = row.getValue("min_purchase_amount") as number | null;
      return amount ? `$${amount.toFixed(2)}` : "None";
    },
  },
  {
    accessorKey: "usage_limit",
    header: "Usage Limit",
    cell: ({ row }) => {
      const limit = row.getValue("usage_limit") as number | null;
      const used = row.original.used_count;
      return limit !== null ? `${used}/${limit}` : "Unlimited";
    },
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("start_date"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => {
      const date = row.getValue("end_date") ? new Date(row.getValue("end_date") as string) : null;
      return <div>{date ? date.toLocaleDateString() : "Never"}</div>;
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return (
        <Badge variant={isActive ? "default" : "outline"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteConfirmationDialog
            onConfirm={() => handleDelete(row.original.id)}
            title="Are you absolutely sure?"
            description="This action cannot be undone. This will permanently delete this discount code."
          >
            <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              Delete
            </div>
          </DeleteConfirmationDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export function DiscountsDataTable({ data }: { data: Discount[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });

  return (
    <div>
        <div className="flex items-center py-4">
            <Input
            placeholder="Filter by code..."
            value={(table.getColumn("code")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("code")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
        </div>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    No discounts found.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            >
            Previous
            </Button>
            <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            >
            Next
            </Button>
        </div>
    </div>
  );
}