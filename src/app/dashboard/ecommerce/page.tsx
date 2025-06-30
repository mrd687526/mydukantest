import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Users, LineChart, Ticket, ReceiptText } from "lucide-react"; // Added ReceiptText icon

const tools = [
  {
    title: "Orders",
    description: "View and manage your store's orders.",
    href: "/dashboard/ecommerce/orders",
    icon: ShoppingCart,
  },
  {
    title: "Products",
    description: "Create and manage your products.",
    href: "/dashboard/ecommerce/products",
    icon: Package,
  },
  {
    title: "Customers",
    description: "View and manage your customer list.",
    href: "/dashboard/ecommerce/customers",
    icon: Users,
  },
  {
    title: "Analytics",
    description: "Track sales, traffic, and other key metrics.",
    href: "/dashboard/ecommerce/analytics",
    icon: LineChart,
  },
  {
    title: "Discounts",
    description: "Create and manage discount codes.",
    href: "/dashboard/ecommerce/discounts",
    icon: Ticket,
  },
  {
    title: "Refund Requests", // New tool
    description: "Manage customer refund requests.",
    href: "/dashboard/ecommerce/refunds",
    icon: ReceiptText, // Using ReceiptText icon
  },
];

export default function EcommerceDashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">E-Commerce Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of your store and quick access to management tools.
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