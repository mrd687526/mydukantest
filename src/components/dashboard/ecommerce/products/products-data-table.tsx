"use client";

import * as React from "react";
import Image from "next/image";
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
import { Product } from "@/lib/types";
import { deleteProduct } from "@/app/actions/products";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";

async function handleDelete(productId: string) {
  const result = await deleteProduct(productId);
  if (result.error) {
    toast.error("Failed to delete product", { description: result.error });
  } else {
    toast.success("Product deleted successfully.");
  }
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium pl-4">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <div>{row.getValue("category") || "N/A"}</div>,
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => <div>{row.getValue("brand") || "N/A"}</div>,
  },
  {
    accessorKey: "label",
    header: "Label",
    cell: ({ row }) => <div>{row.getValue("label") || "N/A"}</div>,
  },
  {
    accessorKey: "image_url",
    header: "Cover Image",
    cell: ({ row }) => {
      const imageUrl = row.getValue("image_url") as string;
      return imageUrl ? (
        <Image src={imageUrl} alt="Product Image" width={48} height={48} className="rounded-md object-cover" />
      ) : (
        <div className="h-12 w-12 bg-muted flex items-center justify-center rounded-md text-muted-foreground text-xs text-center">No Image</div>
      );
    },
  },
  {
    accessorKey: "variant",
    header: "Variant",
    cell: ({ row }) => <div>{row.getValue("variant") || "N/A"}</div>,
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "inventory_quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stock Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("inventory_quantity")}</div>,
  },
  {
    id: "stock_status",
    header: "Stock Status",
    cell: ({ row }) => {
      const quantity = row.getValue("inventory_quantity") as number;
      const status = quantity > 0 ? "In Stock" : "Out of Stock";
      const variant = quantity > 0 ? "default" : "destructive";
      return <Badge variant={variant}>{status}</Badge>;
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
            description="This action cannot be undone. This will permanently delete your product."
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

export function ProductsDataTable({ data }: { data: Product[] }) {
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
            placeholder="Filter by product name..."
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
                    No products found. Add one to get started!
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