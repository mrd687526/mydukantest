"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ReplyTemplate } from "@/lib/types";
import { CreateReplyTemplateDialog } from "./create-reply-template-dialog";
import { ReplyTemplatesDataTable } from "./reply-templates-data-table";

interface ReplyTemplatesClientProps {
  replyTemplates: ReplyTemplate[];
}

export function ReplyTemplatesClient({ replyTemplates }: ReplyTemplatesClientProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Reply Templates</CardTitle>
            <CardDescription>
              Create, manage, and search your reusable reply templates for public replies, DMs, and AI-generated responses.
            </CardDescription>
          </div>
          <CreateReplyTemplateDialog />
        </div>
      </CardHeader>
      <CardContent>
        <ReplyTemplatesDataTable data={replyTemplates} />
      </CardContent>
    </Card>
  );
}