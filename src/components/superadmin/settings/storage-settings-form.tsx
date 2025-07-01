"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateStorageSettings } from "@/app/actions/settings";

const FILE_TYPES = ["png", "jpg", "jpeg", "gif", "webp", "svg"];

const storageSettingsSchema = z.object({
  storage_allowed_file_types: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one file type.",
  }),
  storage_max_file_size_mb: z.coerce.number().min(1, "Max file size must be at least 1 MB."),
});

type StorageSettingsFormValues = z.infer<typeof storageSettingsSchema>;

interface StorageSettingsFormProps {
  initialData: Record<string, any>;
}

export function StorageSettingsForm({ initialData }: StorageSettingsFormProps) {
  const form = useForm<StorageSettingsFormValues>({
    resolver: zodResolver(storageSettingsSchema),
    defaultValues: {
      storage_allowed_file_types: initialData.storage_allowed_file_types?.split(',') || [],
      storage_max_file_size_mb: Number(initialData.storage_max_file_size_mb) || 5,
    },
  });

  const onSubmit = async (data: StorageSettingsFormValues) => {
    const result = await updateStorageSettings(data);
    if (result.error) {
      toast.error("Failed to update settings", { description: result.error });
    } else {
      toast.success(result.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="storage_allowed_file_types"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Allowed File Types</FormLabel>
                <FormDescription>Select which file types users are allowed to upload.</FormDescription>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {FILE_TYPES.map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="storage_allowed_file_types"
                    render={({ field }) => (
                      <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item])
                                : field.onChange(field.value?.filter((value) => value !== item));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal uppercase">{item}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="storage_max_file_size_mb"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max File Size (MB)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="5" {...field} />
              </FormControl>
              <FormDescription>Set the maximum allowed file size for uploads in megabytes.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Storage Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}