import { createServerClient } from "@/integrations/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, ShoppingCart, DollarSign, Clock, CalendarDays, Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Customer, CustomerEvent } from "@/lib/types";
import { getCustomerEvents } from "@/app/actions/customer-events";

interface CustomerDetailPageProps {
  params: Promise<{ customerId: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const actualParams = await params;
  const supabase = createServerClient();
  const { customerId } = actualParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/dashboard");

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .eq("profile_id", profile.id)
    .single();

  if (customerError || !customer) {
    console.error("Error fetching customer:", customerError);
    notFound();
  }

  // Fetch aggregated data for the customer using RPC (same as customer list)
  const { data: customerAnalytics, error: analyticsError } = await supabase.rpc("get_customer_analytics", {
    p_profile_id: profile.id,
  }).eq('id', customerId).single();

  if (analyticsError) {
    console.error("Error fetching customer analytics:", analyticsError);
    // Continue with partial data if analytics fail
  }

  const { data: events, error: eventsError } = await getCustomerEvents(customerId);

  if (eventsError) {
    console.error("Error fetching customer events:", eventsError);
  }

  const customerWithAnalytics: Customer = {
    ...customer,
    orders_count: customerAnalytics?.orders_count || 0,
    total_spend: customerAnalytics?.total_spend || 0,
    aov: customerAnalytics?.aov || 0,
  };

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/ecommerce/customers"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Customers
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{customerWithAnalytics.name}</h1>
        <Badge variant="outline" className="capitalize text-lg px-3 py-1">
          Status: {customerWithAnalytics.status}
        </Badge>
      </div>

      {/* Customer Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{customerWithAnalytics.email}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerWithAnalytics.orders_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${customerWithAnalytics.total_spend.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${customerWithAnalytics.aov.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {customerWithAnalytics.last_active ? format(new Date(customerWithAnalytics.last_active), 'PPP p') : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered On</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {format(new Date(customerWithAnalytics.created_at), 'PPP')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Activity Timeline</CardTitle>
          <CardDescription>A chronological log of key interactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerTimeline events={events || []} />
        </CardContent>
      </Card>
    </div>
  );
}

// Client component for the timeline
function CustomerTimeline({ events }: { events: CustomerEvent[] }) {
  const getEventIcon = (eventType: CustomerEvent['event_type']) => {
    switch (eventType) {
      case 'registered': return <User className="h-4 w-4 text-blue-500" />;
      case 'last_login': return <Clock className="h-4 w-4 text-green-500" />;
      case 'added_to_cart': return <ShoppingCart className="h-4 w-4 text-purple-500" />;
      case 'placed_order': return <DollarSign className="h-4 w-4 text-yellow-500" />;
      case 'added_to_wishlist': return <Activity className="h-4 w-4 text-red-500" />; // Placeholder icon
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventDescription = (event: CustomerEvent) => {
    switch (event.event_type) {
      case 'registered': return `Customer registered an account.`;
      case 'last_login': return `Customer logged in.`;
      case 'added_to_cart': return `Added "${event.event_details?.product_name || 'a product'}" to cart.`;
      case 'placed_order': return `Placed order #${event.event_details?.order_id?.substring(0, 8) || 'N/A'} for $${(event.event_details?.total_amount || 0).toFixed(2)}.`;
      case 'added_to_wishlist': return `Added "${event.event_details?.product_name || 'a product'}" to wishlist.`;
      default: return `Unknown event: ${event.event_type}`;
    }
  };

  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
      {events.length > 0 ? (
        events.map((event, index) => (
          <div key={event.id} className="mb-6 relative">
            <div className="absolute left-0 -translate-x-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600">
              {getEventIcon(event.event_type)}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {getEventDescription(event)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(event.created_at), 'PPP p')}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground text-center py-8">No activity recorded for this customer yet.</p>
      )}
    </div>
  );
}