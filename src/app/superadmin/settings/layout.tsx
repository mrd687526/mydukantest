import { type PropsWithChildren } from "react";
import { SettingsSidebar } from "@/components/superadmin/settings/settings-sidebar";

export default function SuperAdminSettingsLayout({ children }: PropsWithChildren) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
      <SettingsSidebar />
      <div>
        {children}
      </div>
    </div>
  );
}