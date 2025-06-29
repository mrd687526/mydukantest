"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createReplyTemplate } from "@/app/actions/templates";

const replyTemplateFormSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters."),
  template_text: z.string().min(1, "Template text cannot be empty."),
  reply_type: z.enum(["public", "private", "ai"]),
});

type ReplyTemplateFormValues = z.infer<typeof replyTemplateFormSchema>;

export function CreateReplyTemplateDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const form = useForm<ReplyTemplateFormValues>({
    resolver: zodResolver(replyTemplateFormSchema),
    defaultValues: { name: "", template_text: "", reply_type: "public" },
  });

  const onSubmit = async (data: ReplyTemplateFormValues) => {
    const result = await createReplyTemplate(data);
    if (result.error) {
      toast.error("Failed to create reply template", { description: result.error });
    } else {
      toast.success("Reply template created successfully!");
      form.reset();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Reply Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Reply Template</DialogTitle>
          <DialogDescription>
            Add a new reusable reply template for different actions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'AI-powered Welcome'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reply_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reply Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reply type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public Reply</SelectItem>
                      <SelectItem value="private">Private Message (DM)</SelectItem>
                      <SelectItem value="ai">AI Generated</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="template_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Text</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your reply template here..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}