"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createCountry, updateCountry, createState, updateState, createRegion, updateRegion } from "@/app/actions/geography";
import { Country, State, Region } from "@/lib/types";

type GeoEntityType = 'country' | 'state' | 'region';
type GeoEntity = Country | State | Region;

interface GeographyFormDialogProps {
  type: GeoEntityType;
  initialData?: GeoEntity | null;
  parentId?: number;
  onClose: () => void;
  onSuccess: (data: GeoEntity) => void;
}

const countrySchema = z.object({
  name: z.string().min(1, "Name is required."),
  iso2: z.string().length(2, "ISO2 code must be 2 characters."),
});
const stateSchema = z.object({ name: z.string().min(1, "Name is required.") });
const regionSchema = z.object({ name: z.string().min(1, "Name is required.") });

const schemas = {
  country: countrySchema,
  state: stateSchema,
  region: regionSchema,
};

export function GeographyFormDialog({ type, initialData, parentId, onClose, onSuccess }: GeographyFormDialogProps) {
  const form = useForm({
    resolver: zodResolver(schemas[type]),
    defaultValues: {
      name: (initialData as any)?.name || "",
      iso2: (initialData as Country)?.iso2 || "",
    },
  });

  const isEditing = !!initialData;
  const title = `${isEditing ? 'Edit' : 'Add'} ${type.charAt(0).toUpperCase() + type.slice(1)}`;

  const onSubmit = async (values: any) => {
    let result;
    if (type === 'country') {
      result = isEditing ? await updateCountry(initialData!.id, values) : await createCountry(values);
    } else if (type === 'state') {
      result = isEditing ? await updateState(initialData!.id, values) : await createState({ ...values, country_id: parentId! });
    } else { // region
      result = isEditing ? await updateRegion(initialData!.id, values) : await createRegion({ ...values, state_id: parentId! });
    }

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      // We need to refetch to get the ID for new items. For now, we'll just close and let the parent refetch.
      // A better implementation would return the new entity from the server action.
      onClose(); // Let parent handle refetching and state update
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {type === 'country' && (
              <FormField control={form.control} name="iso2" render={({ field }) => (
                <FormItem>
                  <FormLabel>ISO2 Code</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}