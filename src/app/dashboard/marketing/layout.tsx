import { type PropsWithChildren } from "react";
import { MarketingSidebar } from "@/components/dashboard/marketing/marketing-sidebar";

export default function MarketingLayout({ children }: PropsWithChildren) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing Tools</h1>
        <p className="text-muted-foreground">
          Manage your store's marketing campaigns and customer engagement.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        <MarketingSidebar />
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}