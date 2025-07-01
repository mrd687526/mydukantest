import { type PropsWithChildren } from "react";
import { SettingsSidebar } from "@/components/dashboard/settings/settings-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function StoreSettingsLayout({ children }: PropsWithChildren) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground">
          Manage your storefront's identity, SEO, customizations, and operational settings.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        <SettingsSidebar />
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}