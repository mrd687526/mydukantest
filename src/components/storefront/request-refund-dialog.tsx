"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FileUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createCustomerRefundRequest } from "@/app/actions/refunds";

const refundRequestSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters."),
  attachment: z.any()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, `Max file size is 5MB.`)
    .refine((file) => !file || ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), `Only .jpg, .png, and .pdf formats are supported.`)
    .optional(),
});

type RefundRequestFormValues = z.infer<typeof refundRequestSchema>;

interface RequestRefundDialogProps {
  orderId: string;
  onClose: () => void;
}

export function RequestRefundDialog({ orderId, onClose }: RequestRefundDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RefundRequestFormValues>({
    resolver: zodResolver(refundRequestSchema),
    defaultValues: {
      reason: "",
    },
  });

  const onSubmit = async (data: RefundRequestFormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('order_id', orderId);
    formData.append('reason', data.reason);
    if (data.attachment) {
      formData.append('attachment', data.attachment);
    }

    const result = await createCustomerRefundRequest(formData);

    if (result.error) {
      toast.error("Failed to submit refund request", {
        description: result.error,
      });
    } else {
      toast.success(result.message);
      form.reset();
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Request Refund for Order</DialogTitle>
          <DialogDescription>
            Please provide a detailed reason for your refund request.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Refund</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Item arrived damaged, wrong size, etc." rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attachment"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Attachment (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(event) => {
                        onChange(event.target.files && event.target.files[0]);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Max 5MB. Supported formats: JPG, PNG, PDF.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}