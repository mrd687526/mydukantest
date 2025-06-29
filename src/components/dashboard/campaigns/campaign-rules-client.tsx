"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { createCampaignRule, deleteCampaignRule } from "@/app/actions/rules";
import type { CampaignRule, ReplyTemplate } from "@/lib/types";

const ruleFormSchema = z.object({
  keyword: z.string().min(1, "Keyword is required."),
  match_type: z.enum(["exact", "contains"]),
  action: z.enum(["reply", "dm", "hide", "delete", "like"]),
  reply_template_id: z.string().uuid().optional().nullable(),
});

type RuleFormValues = z.infer<typeof ruleFormSchema>;

interface CampaignRulesClientProps {
  campaignId: string;
  rules: CampaignRule[];
  replyTemplates: ReplyTemplate[];
}

export function CampaignRulesClient({ campaignId, rules, replyTemplates }: CampaignRulesClientProps) {
  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      keyword: "",
      match_type: "contains",
      action: "reply",
      reply_template_id: null,
    },
  });

  const onSubmit = async (data: RuleFormValues) => {
    const result = await createCampaignRule({ ...data, campaign_id: campaignId });
    if (result.error) {
      toast.error("Failed to create rule", { description: result.error });
    } else {
      toast.success("Rule created successfully!");
      form.reset();
    }
  };

  const handleDelete = async (ruleId: string) => {
    const result = await deleteCampaignRule(ruleId, campaignId);
     if (result.error) {
      toast.error("Failed to delete rule", { description: result.error });
    } else {
      toast.success("Rule deleted successfully!");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Rules</CardTitle>
        <CardDescription>
          Define keywords and actions for incoming comments. Rules are checked in order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Rules Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Reply Template</TableHead>
                <TableHead className="text-right">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length > 0 ? (
                rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.keyword}</TableCell>
                    <TableCell><Badge variant="secondary">{rule.match_type}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{rule.action}</Badge></TableCell>
                    <TableCell>{rule.reply_templates?.name || "N/A"}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No rules created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Rule Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Add New Rule</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField control={form.control} name="keyword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Keyword</FormLabel>
                  <FormControl><Input placeholder="e.g., 'info'" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="match_type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Match Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="exact">Exact</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="action" render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="reply">Public Reply</SelectItem>
                      <SelectItem value="dm">Private Message</SelectItem>
                      <SelectItem value="like">Like Comment</SelectItem>
                      <SelectItem value="hide">Hide Comment</SelectItem>
                      <SelectItem value="delete">Delete Comment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="reply_template_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Reply Template</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {replyTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding Rule..." : "Add Rule"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}