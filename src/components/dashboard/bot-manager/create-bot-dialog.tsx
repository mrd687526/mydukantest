"use client";

import { useState } from "react";
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
import { createBot } from "@/app/actions/bots";

const botFormSchema = z.object({
  name: z.string().min(3, "Bot name must be at least 3 characters."),
});

type BotFormValues = z.infer<typeof botFormSchema>;

interface CreateBotDialogProps {
  connectedAccountId: string;
}

export function CreateBotDialog({ connectedAccountId }: CreateBotDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<BotFormValues>({
    resolver: zodResolver(botFormSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (data: BotFormValues) => {
    const result = await createBot({ ...data, connected_account_id: connectedAccountId });

    if (result.error) {
      toast.error("Failed to create bot", { description: result.error });
    } else {
      toast.success("Bot created successfully!");
      form.reset();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Bot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Bot</DialogTitle>
          <DialogDescription>
            Give your new bot a name to get started. You can build the conversation flow in the next step.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Customer Support Bot'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Bot"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}