"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignCampaignToPost } from "@/app/actions/campaigns";
import type { AutomationCampaign } from "@/lib/types";

const formSchema = z.object({
  campaignId: z.string().uuid("Please select a campaign."),
});

interface AutomatePostDialogProps {
  postId: string;
  campaigns: AutomationCampaign[];
  onClose: () => void;
}

export function AutomatePostDialog({
  postId,
  campaigns,
  onClose,
}: AutomatePostDialogProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: { campaignId: string }) => {
    const result = await assignCampaignToPost(data.campaignId, postId);
    if (result.error) {
      toast.error("Failed to assign campaign", {
        description: result.error,
      });
    } else {
      toast.success("Automation enabled for this post!");
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Automate Replies for Post</DialogTitle>
          <DialogDescription>
            Select an automation campaign to run on comments for this post.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="campaignId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a campaign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {campaigns.length > 0 ? (
                        campaigns.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No unassigned campaigns available.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || campaigns.length === 0}
              >
                {form.formState.isSubmitting
                  ? "Enabling..."
                  : "Enable Automation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}