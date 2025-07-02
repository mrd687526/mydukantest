import { MetaSettingsForm } from "@/components/superadmin/settings/meta-settings-form";

export default function MetaSettingsPage() {
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Meta App Settings</h1>
      <MetaSettingsForm />
    </div>
  );
} 