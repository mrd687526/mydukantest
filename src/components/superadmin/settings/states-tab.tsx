"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/superadmin/settings/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Country, State } from "@/lib/types";
import { getStates, toggleStateStatus } from "@/app/actions/geography";
import { GeographyFormDialog } from "./geography-form-dialog";

interface StatesTabProps {
  country: Country;
  onStateSelected: (state: State | null) => void;
}

export function StatesTab({ country, onStateSelected }: StatesTabProps) {
  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingState, setEditingState] = useState<State | null>(null);

  useEffect(() => {
    const fetchStates = async () => {
      setIsLoading(true);
      const { data, error } = await getStates(country.id);
      if (error) {
        toast.error(error);
      } else {
        setStates(data || []);
      }
      setIsLoading(false);
    };
    fetchStates();
  }, [country]);

  const handleToggleStatus = async (state: State) => {
    const result = await toggleStateStatus(state.id, state.is_active);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setStates(prev => prev.map(s => s.id === state.id ? { ...s, is_active: !s.is_active } : s));
    }
  };

  const columns: ColumnDef<State>[] = [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        row.original.is_active
          ? <span className="flex items-center text-green-600"><CheckCircle className="mr-2 h-4 w-4" /> Active</span>
          : <span className="flex items-center text-red-600"><XCircle className="mr-2 h-4 w-4" /> Inactive</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingState(row.original); setIsDialogOpen(true); }}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStateSelected(row.original)}>View Regions</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(row.original)}>Toggle Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">States for {country.name}</h3>
        <Button onClick={() => { setEditingState(null); setIsDialogOpen(true); }}>Add New State</Button>
      </div>
      <DataTable columns={columns} data={states} isLoading={isLoading} />
      {isDialogOpen && (
        <GeographyFormDialog
          type="state"
          parentId={country.id}
          initialData={editingState}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={(data) => {
            if (editingState) {
              setStates(prev => prev.map(s => s.id === data.id ? data as State : s));
            } else {
              setStates(prev => [...prev, data as State].sort((a, b) => a.name.localeCompare(b.name)));
            }
            setIsDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}