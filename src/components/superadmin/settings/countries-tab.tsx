"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/superadmin/settings/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Country } from "@/lib/types";
import { toggleCountryStatus } from "@/app/actions/geography";
import { GeographyFormDialog } from "./geography-form-dialog";

interface CountriesTabProps {
  countries: Country[];
  onCountryCreated: (newCountry: Country) => void;
  onCountryUpdated: (updatedCountry: Country) => void;
  onCountrySelected: (country: Country | null) => void;
}

export function CountriesTab({ countries, onCountryCreated, onCountryUpdated, onCountrySelected }: CountriesTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  const handleToggleStatus = async (country: Country) => {
    const result = await toggleCountryStatus(country.id, country.is_active);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      onCountryUpdated({ ...country, is_active: !country.is_active });
    }
  };

  const columns: ColumnDef<Country>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "iso2", header: "ISO2 Code" },
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
            <DropdownMenuItem onClick={() => { setEditingCountry(row.original); setIsDialogOpen(true); }}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCountrySelected(row.original)}>View States</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(row.original)}>Toggle Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditingCountry(null); setIsDialogOpen(true); }}>Add New Country</Button>
      </div>
      <DataTable columns={columns} data={countries} />
      {isDialogOpen && (
        <GeographyFormDialog
          type="country"
          initialData={editingCountry}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={(data) => {
            if (editingCountry) {
              onCountryUpdated(data as Country);
            } else {
              onCountryCreated(data as Country);
            }
            setIsDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}