"use client";

import * as React from "react";
import Link from "next/link";
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
import { format } from "date-fns";

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
import { FlashSale } from "@/lib/types";
import { deleteFlashSale } from "@/app/actions/flash-sales";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";
import { EditFlashSaleDialog } from "./edit-flash-sale-dialog";

async function handleDelete(flashSaleId: string) {
  const result = await deleteFlashSale(flashSaleId);
  if (result.error) {
    toast.error("Failed to delete flash sale", { description: result.error });
  } else {
    toast.success(result.message);
  }
}

export const columns: ColumnDef<FlashSale>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sale Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium pl-4">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "discount_type",
    header: "Discount Type",
    cell: ({ row }) => {
      const type = row.getValue("discount_type") as FlashSale['discount_type'];
      return <Badge variant="secondary" className="capitalize">{type.replace('_', ' ')}</Badge>;
    },
  },
  {
    accessorKey: "discount_value",
    header: "Value",
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("discount_value"));
      const type = row.original.discount_type;
      if (type === 'percentage') return `${value}%`;
      if (type === 'fixed_amount') return `$${value.toFixed(2)}`;
      return "N/A";
    },
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("start_date"));
      return <div>{format(date, 'yyyy-MM-dd HH:mm')}</div>;
    },
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("end_date"));
      return <div>{format(date, 'yyyy-MM-dd HH:mm')}</div>;
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      const now = new Date();
      const startDate = new Date(row.original.start_date);
      const endDate = new Date(row.original.end_date);

      let statusText = "Inactive";
      let variant: "default" | "secondary" | "outline" | "destructive" = "outline";

      if (isActive) {
        if (now >= startDate && now <= endDate) {
          statusText = "Active";
          variant = "default";
        } else if (now < startDate) {
          statusText = "Scheduled";
          variant = "secondary";
        } else {
          statusText = "Expired";
          variant = "destructive";
        }
      }

      return (
        <Badge variant={variant}>
          {statusText}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
      const flashSale = row.original;
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteConfirmationDialog
                onConfirm={() => handleDelete(row.original.id)}
                title="Are you absolutely sure?"
                description="This action cannot be undone. This will permanently delete this flash sale."
              >
                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  Delete
                </div>
              </DeleteConfirmationDialog>
            </DropdownMenuContent>
          </DropdownMenu>

          {isEditDialogOpen && (
            <EditFlashSaleDialog
              flashSale={flashSale}
              isOpen={isEditDialogOpen}
              onClose={() => setIsEditDialogOpen(false)}
            />
          )}
        </>
      );
    },
  },
];

export function FlashSalesDataTable({ data }: { data: FlashSale[] }) {
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
            placeholder="Filter by name..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
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
                    No flash sales found.
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