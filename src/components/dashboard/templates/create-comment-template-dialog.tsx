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
import { createCommentTemplate } from "@/app/actions/templates";

const commentTemplateFormSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters."),
  template_text: z.string().min(1, "Template text cannot be empty."),
});
type CommentTemplateFormValues = z.infer<typeof commentTemplateFormSchema>;

export function CreateCommentTemplateDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const form = useForm<CommentTemplateFormValues>({
    resolver: zodResolver(commentTemplateFormSchema),
    defaultValues: { name: "", template_text: "" },
  });

  const onSubmit = async (data: CommentTemplateFormValues) => {
    const result = await createCommentTemplate(data);
    if (result.error) {
      toast.error("Failed to create template", { description: result.error });
    } else {
      toast.success("Comment template created successfully!");
      form.reset();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Comment Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Comment Template</DialogTitle>
          <DialogDescription>
            Add a new reusable comment template to your collection.
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
                    <Input placeholder="e.g., 'Positive Feedback Reply'" {...field} />
                  </FormControl>
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
                    <Textarea placeholder="Write your comment template here..." {...field} />
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