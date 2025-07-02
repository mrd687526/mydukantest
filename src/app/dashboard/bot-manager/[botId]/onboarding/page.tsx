import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BotMetaOnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Meta App Onboarding</h1>
      <ol className="list-decimal pl-6 space-y-6">
        <li>
          <div className="font-semibold mb-2">Connect your Facebook account</div>
          <Button variant="outline" disabled>Connect Facebook (Coming Soon)</Button>
        </li>
        <li>
          <div className="font-semibold mb-2">Grant permissions for Pages and Instagram</div>
          <Button variant="outline" disabled>Request Permissions (Coming Soon)</Button>
        </li>
        <li>
          <div className="font-semibold mb-2">Select your Facebook Page or Instagram Account</div>
          <Button variant="outline" disabled>Select Page/Account (Coming Soon)</Button>
        </li>
        <li>
          <div className="font-semibold mb-2">Finish setup</div>
          <Button asChild>
            <Link href="../flow">Go to Bot Flow Builder</Link>
          </Button>
        </li>
      </ol>
    </div>
  );
} 