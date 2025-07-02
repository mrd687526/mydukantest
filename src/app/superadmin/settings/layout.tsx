import { type PropsWithChildren } from "react";
import { SettingsSidebar } from "@/components/superadmin/settings/settings-sidebar";

export default function SuperAdminSettingsLayout({ children }: PropsWithChildren) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
      <SettingsSidebar />
      <div>
        <nav className="mb-8">
          <ul className="space-y-2">
            <li>
              <a href="/superadmin/settings/meta" className="text-blue-600 hover:underline">Meta App Settings</a>
            </li>
          </ul>
        </nav>
        {children}
      </div>
    </div>
  );
}