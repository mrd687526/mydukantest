"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/superadmin/settings/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { State, Region } from "@/lib/types";
import { getRegions, toggleRegionStatus } from "@/app/actions/geography";
import { GeographyFormDialog } from "./geography-form-dialog";

interface RegionsTabProps {
  state: State;
}

export function RegionsTab({ state }: RegionsTabProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);

  useEffect(() => {
    const fetchRegions = async () => {
      setIsLoading(true);
      const { data, error } = await getRegions(state.id);
      if (error) {
        toast.error(error);
      } else {
        setRegions(data || []);
      }
      setIsLoading(false);
    };
    fetchRegions();
  }, [state]);

  const handleToggleStatus = async (region: Region) => {
    const result = await toggleRegionStatus(region.id, region.is_active);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setRegions(prev => prev.map(r => r.id === region.id ? { ...r, is_active: !r.is_active } : r));
    }
  };

  const columns: ColumnDef<Region>[] = [
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
            <DropdownMenuItem onClick={() => { setEditingRegion(row.original); setIsDialogOpen(true); }}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(row.original)}>Toggle Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Regions for {state.name}</h3>
        <Button onClick={() => { setEditingRegion(null); setIsDialogOpen(true); }}>Add New Region</Button>
      </div>
      <DataTable columns={columns} data={regions} isLoading={isLoading} />
      {isDialogOpen && (
        <GeographyFormDialog
          type="region"
          parentId={state.id}
          initialData={editingRegion}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={(data) => {
            if (editingRegion) {
              setRegions(prev => prev.map(r => r.id === data.id ? data as Region : r));
            } else {
              setRegions(prev => [...prev, data as Region].sort((a, b) => a.name.localeCompare(b.name)));
            }
            setIsDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}