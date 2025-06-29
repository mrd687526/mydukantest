"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentTemplate, ReplyTemplate } from "@/lib/types";
import { CommentTemplatesDataTable } from "./comment-templates-data-table";
import { CreateCommentTemplateDialog } from "./create-comment-template-dialog";
import { ReplyTemplatesDataTable } from "./reply-templates-data-table";
import { CreateReplyTemplateDialog } from "./create-reply-template-dialog";

interface TemplatesClientProps {
  commentTemplates: CommentTemplate[];
  replyTemplates: ReplyTemplate[];
}

export function TemplatesClient({ commentTemplates, replyTemplates }: TemplatesClientProps) {
  return (
    <Tabs defaultValue="comments">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="comments">Comment Templates</TabsTrigger>
          <TabsTrigger value="replies">Reply Templates</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="comments">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Comment Templates</CardTitle>
                <CardDescription>
                  Create and manage your reusable comment templates.
                </CardDescription>
              </div>
              <CreateCommentTemplateDialog />
            </div>
          </CardHeader>
          <CardContent>
            <CommentTemplatesDataTable data={commentTemplates} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="replies">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Reply Templates</CardTitle>
                <CardDescription>
                  Manage templates for public replies, DMs, and AI-generated responses.
                </CardDescription>
              </div>
              <CreateReplyTemplateDialog />
            </div>
          </CardHeader>
          <CardContent>
            <ReplyTemplatesDataTable data={replyTemplates} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}