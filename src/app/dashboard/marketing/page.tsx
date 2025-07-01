import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, Zap, Mail, DollarSign } from "lucide-react";

const marketingTools = [
  {
    title: "Coupons",
    description: "Create and manage discount codes for your products.",
    href: "/dashboard/marketing/coupons",
    icon: Tag,
  },
  {
    title: "Flash Sales",
    description: "Set up limited-time sales and promotions.",
    href: "/dashboard/marketing/flash-sales",
    icon: Zap,
  },
  {
    title: "Newsletter",
    description: "Manage your subscriber list for email marketing.",
    href: "/dashboard/marketing/newsletter",
    icon: Mail,
  },
  // {
  //   title: "Abandoned Carts",
  //   description: "Recover lost sales with automated reminders.",
  //   href: "/dashboard/marketing/abandoned-carts",
  //   icon: ShoppingCart,
  // },
];

export default function MarketingDashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
        <p className="text-muted-foreground">
          Tools to help you promote your store and drive sales.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {marketingTools.map((tool) => (
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