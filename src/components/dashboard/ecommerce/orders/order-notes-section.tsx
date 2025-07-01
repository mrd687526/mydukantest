"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { MessageSquareText, Eye, EyeOff, Trash2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createOrderNote, getOrderNotes, deleteOrderNote } from "@/app/actions/order-notes";
import { OrderNote } from "@/lib/types";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";

const noteFormSchema = z.object({
  note_text: z.string().min(1, "Note cannot be empty."),
  is_customer_visible: z.boolean().default(false),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

interface OrderNotesSectionProps {
  orderId: string;
}

export function OrderNotesSection({ orderId }: OrderNotesSectionProps) {
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      note_text: "",
      is_customer_visible: false,
    },
  });

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      const { data, error } = await getOrderNotes(orderId);
      if (error) {
        toast.error("Failed to load order notes", { description: error });
        setNotes([]);
      } else {
        setNotes(data || []);
      }
      setIsLoading(false);
    };
    fetchNotes();
  }, [orderId]);

  const onSubmit = async (data: NoteFormValues) => {
    startTransition(async () => {
      const result = await createOrderNote({ ...data, order_id: orderId });
      if (result.error) {
        toast.error("Failed to add note", { description: result.error });
      } else {
        toast.success(result.message);
        form.reset();
        // Re-fetch notes to update the list
        const { data: updatedNotes } = await getOrderNotes(orderId);
        if (updatedNotes) setNotes(updatedNotes);
      }
    });
  };

  const handleDelete = async (noteId: number) => {
    startTransition(async () => {
      const result = await deleteOrderNote(noteId, orderId);
      if (result.error) {
        toast.error("Failed to delete note", { description: result.error });
      } else {
        toast.success(result.message);
        setNotes(prev => prev.filter(note => note.id !== noteId));
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Notes</CardTitle>
        <CardDescription>Add internal notes or messages visible to the customer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="note_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Note</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add a note about this order..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_customer_visible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Visible to Customer?</FormLabel>
                    <FormDescription>
                      If checked, this note will be visible on the customer's order history page.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting || isPending}>
              {form.formState.isSubmitting || isPending ? "Adding Note..." : "Add Note"}
            </Button>
          </form>
        </Form>

        <div className="space-y-4 mt-8">
          <h3 className="font-semibold text-lg">All Notes ({notes.length})</h3>
          {isLoading ? (
            <p className="text-muted-foreground">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-muted-foreground">No notes for this order yet.</p>
          ) : (
            <div className="border rounded-md divide-y">
              {notes.map((note) => (
                <div key={note.id} className="p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm">{note.note_text}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span className="mr-2">{format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}</span>
                      {note.is_customer_visible ? (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Visible to Customer
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <EyeOff className="h-3 w-3" /> Internal Only
                        </span>
                      )}
                    </div>
                  </div>
                  <DeleteConfirmationDialog
                    onConfirm={() => handleDelete(note.id)}
                    title="Delete Note?"
                    description="Are you sure you want to delete this note? This action cannot be undone."
                  >
                    <Button variant="ghost" size="icon" disabled={isPending}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </DeleteConfirmationDialog>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}