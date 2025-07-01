import { redirect } from "next/navigation";

export default function ReportsLandingPage() {
  // Redirect to the default customer reports page
  redirect("/dashboard/reports/customer");
}