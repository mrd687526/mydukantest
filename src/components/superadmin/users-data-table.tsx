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
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";
import { deleteUserAndProfile } from "@/app/actions/superadmin";
import { UserProfileWithSubscription } from "@/lib/types"; // Import from shared types
import { EditUserDialog } from "./edit-user-dialog"; // Updated import

async function handleDelete(userId: string) {
  const result = await deleteUserAndProfile(userId);
  if (result.error) {
    toast.error("Failed to delete user", { description: result.error });
  } else {
    toast.success(result.message);
  }
}

export const columns: ColumnDef<UserProfileWithSubscription>[] = [
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
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.original.email}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <Badge variant="secondary" className="capitalize">{role.replace('_', ' ')}</Badge>;
    },
  },
  {
    accessorKey: "subscription_status",
    header: "Subscription Status",
    cell: ({ row }) => {
      const status = row.original.subscription_status;
      const endDate = row.original.subscription_end_date ? format(new Date(row.original.subscription_end_date), 'yyyy-MM-dd') : 'N/A';
      const planName = row.original.plan_name;
      
      if (status) {
        let variant: "default" | "secondary" | "outline" | "destructive" = "default";
        if (status === 'trialing') variant = "secondary";
        if (status === 'canceled' || status === 'unpaid' || status === 'past_due') variant = "destructive";

        return (
          <div className="flex flex-col">
            <Badge variant={variant} className="capitalize">{status.replace('_', ' ')}</Badge>
            {planName && <span className="text-xs text-muted-foreground mt-1">Plan: {planName}</span>}
            {row.original.subscription_end_date && (
              <span className="text-xs text-muted-foreground mt-1">Ends: {endDate}</span>
            )}
          </div>
        );
      }
      return <Badge variant="outline">None</Badge>;
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
          Registered At
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
    cell: ({ row, table }) => { // Access table context to get allPlans
      const [isEditUserDialogOpen, setIsEditUserDialogOpen] = React.useState(false);
      const userProfile = row.original;
      const allPlans = (table.options.meta as { allPlans: Plan[] }).allPlans; // Access allPlans from meta

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
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditUserDialogOpen(true)}>
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteConfirmationDialog
                onConfirm={() => handleDelete(userProfile.id)}
                title="Are you absolutely sure?"
                description="This action cannot be undone. This will permanently delete the user account and all associated data."
              >
                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  Delete User
                </div>
              </DeleteConfirmationDialog>
            </DropdownMenuContent>
          </DropdownMenu>

          {isEditUserDialogOpen && (
            <EditUserDialog
              userProfile={userProfile}
              isOpen={isEditUserDialogOpen}
              onClose={() => setIsEditUserDialogOpen(false)}
              allPlans={allPlans} // Pass allPlans to EditUserDialog
            />
          )}
        </>
      );
    },
  },
];

export function UsersDataTable({ data, allPlans }: { data: UserProfileWithSubscription[]; allPlans: Plan[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, columnFilters, globalFilter },
    meta: { allPlans }, // Pass allPlans via meta
  });

  return (
    <div>
        <div className="flex items-center py-4">
            <Input
            placeholder="Filter by name or email..."
            value={globalFilter ?? ""}
            onChange={(event) =>
                setGlobalFilter(event.target.value)
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
                    No users found.
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