"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { NewsletterDataTable } from "./newsletter-data-table";
import { NewsletterSubscriber } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface NewsletterClientProps {
  subscribers: NewsletterSubscriber[];
}

export function NewsletterClient({ subscribers }: NewsletterClientProps) {
  const handleExportCsv = () => {
    if (subscribers.length === 0) {
      toast.info("No subscribers to export.");
      return;
    }

    const headers = ["Email", "Subscribed At"];
    const rows = subscribers.map(s => [s.email, s.subscribed_at]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "newsletter_subscribers.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Subscribers exported to CSV!");
    } else {
      toast.error("Your browser does not support downloading files directly.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Newsletter Subscribers</CardTitle>
            <CardDescription>
              Manage your email marketing subscriber list.
            </CardDescription>
          </div>
          <Button onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <NewsletterDataTable data={subscribers} />
        <p className="text-sm text-muted-foreground mt-4">
          To send newsletters, export this list and use a third-party email marketing service (e.g., Mailchimp, SendGrid).
        </p>
      </CardContent>
    </Card>
  );
}