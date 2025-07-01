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
import { format } from "date-fns";
import Link from "next/link"; // Import Link

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
import { Order } from "@/lib/types";
import { deleteOrder, updateOrderStatus } from "@/app/actions/orders";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";
import { createRefundRequest } from "@/app/actions/refunds"; // Import refund action
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

async function handleDelete(orderId: string) {
  const result = await deleteOrder(orderId);
  if (result.error) {
    toast.error("Failed to delete order", { description: result.error });
  } else {
    toast.success("Order deleted successfully.");
  }
}

async function handleUpdateStatus(orderId: string, newStatus: Order['status']) {
  const result = await updateOrderStatus(orderId, newStatus);
  if (result.error) {
    toast.error("Failed to update order status", { description: result.error });
  } else {
    toast.success(`Order status updated to ${newStatus}.`);
  }
}

async function handleRefundRequest(orderId: string, reason: string, onClose: () => void) {
  const result = await createRefundRequest({ order_id: orderId, reason });
  if (result.error) {
    toast.error("Failed to create refund request", { description: result.error });
  } else {
    toast.success(result.message);
    onClose();
  }
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "order_number",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link href={`/dashboard/ecommerce/orders/${row.original.id}`} className="font-medium pl-4 hover:underline">
        {row.getValue("order_number")}
      </Link>
    ),
  },
  {
    accessorKey: "customer_name",
    header: "Customer Name",
    cell: ({ row }) => <div>{row.getValue("customer_name")}</div>,
  },
  {
    accessorKey: "customer_email",
    header: "Customer Email",
    cell: ({ row }) => <div>{row.getValue("customer_email")}</div>,
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "payment_type",
    header: "Payment Type",
    cell: ({ row }) => {
      const paymentType = row.getValue("payment_type") as string;
      return <Badge variant="secondary" className="capitalize">{paymentType || "N/A"}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as Order['status'];
      let variant: "default" | "secondary" | "outline" | "destructive" = "outline";
      if (status === "delivered") variant = "default";
      if (status === "cancelled") variant = "destructive";
      return <Badge variant={variant} className="capitalize">{status}</Badge>;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div>{format(date, 'yyyy-MM-dd')}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [isRefundDialogOpen, setIsRefundDialogOpen] = React.useState(false);
      const [refundReason, setRefundReason] = React.useState("");

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Link href={`/dashboard/ecommerce/orders/${row.original.id}`} passHref>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                View Details
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleUpdateStatus(row.original.id, 'processing')}>
              Mark as Processing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateStatus(row.original.id, 'shipped')}>
              Mark as Shipped
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateStatus(row.original.id, 'delivered')}>
              Mark as Delivered
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateStatus(row.original.id, 'cancelled')}>
              Mark as Cancelled
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Request Refund
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Request Refund for Order {row.original.order_number}</DialogTitle>
                  <DialogDescription>
                    Provide a reason for the refund request.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason" className="text-right">
                      Reason
                    </Label>
                    <Textarea
                      id="reason"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g., Item damaged, customer changed mind"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsRefundDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => handleRefundRequest(row.original.id, refundReason, () => setIsRefundDialogOpen(false))}>
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <DeleteConfirmationDialog
              onConfirm={() => handleDelete(row.original.id)}
              title="Are you absolutely sure?"
              description="This action cannot be undone. This will permanently delete this order record."
            >
              <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                Delete
              </div>
            </DeleteConfirmationDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function OrdersDataTable({ data }: { data: Order[] }) {
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
            placeholder="Filter by order number or customer name..."
            value={(table.getColumn("order_number")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("order_number")?.setFilterValue(event.target.value)
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
                    No orders found.
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