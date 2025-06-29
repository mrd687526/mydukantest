import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCog, MessageSquareText, BarChart2 } from "lucide-react";

const tools = [
  {
    title: "Automation Campaigns",
    description: "Create and manage automation campaigns.",
    href: "/dashboard/campaigns",
    icon: FileCog,
  },
  {
    title: "Comment & Reply Templates",
    description: "Manage your reusable templates.",
    href: "/dashboard/templates",
    icon: MessageSquareText,
  },
  {
    title: "Reports",
    description: "View all campaign reports.",
    href: "/dashboard/reports",
    icon: BarChart2,
  },
];

export default function CommentManagerPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Comment Growth Tools</h1>
        <p className="text-muted-foreground">
          Manage your Facebook comment automation tools.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.title}>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <tool.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={tool.href} passHref>
                <Button className="w-full">
                  Manage
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}