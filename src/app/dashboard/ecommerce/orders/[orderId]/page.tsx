import { createClient } from "@/integrations/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck, FileText, MessageSquareText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Order, OrderItem, OrderRefundRequest, OrderNote } from "@/lib/types";
import { updateOrderStatus, updateOrderTracking } from "@/app/actions/orders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRefundRequest } from "@/app/actions/refunds";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OrderNotesSection } from "@/components/dashboard/ecommerce/orders/order-notes-section"; // Import new component

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const actualParams = await params;
  const supabase = createClient();
  const { orderId } = actualParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/dashboard");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        product_id,
        variant_id,
        quantity,
        price_at_purchase,
        products ( name, image_url )
      )
    `)
    .eq("id", orderId)
    .eq("profile_id", profile.id)
    .single();

  if (orderError || !order) {
    console.error("Error fetching order:", orderError);
    notFound();
  }

  const { data: refundRequests, error: refundsError } = await supabase
    .from("order_refund_requests")
    .select("*")
    .eq("order_id", orderId)
    .order("request_date", { ascending: false });

  if (refundsError) {
    console.error("Error fetching refund requests for order:", refundsError);
  }

  const orderItems = order.order_items || [];
  const refunds = refundRequests || [];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/ecommerce/orders"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize text-lg px-3 py-1">
            Status: {order.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Update Status</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Change Order Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                <DropdownMenuItem
                  key={status}
                  onClick={async () => {
                    await updateOrderStatus(order.id, status as Order['status']);
                  }}
                  disabled={order.status === status}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Details of order #{order.order_number}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                <p className="font-semibold">{format(new Date(order.created_at), 'PPP p')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-lg">${order.total_amount.toFixed(2)}</p>
              </div>
            </div>

            <h3 className="font-semibold text-lg mt-6 mb-2">Order Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {item.products?.image_url && (
                        <img src={item.products.image_url} alt={item.products.name} className="w-10 h-10 object-cover rounded" />
                      )}
                      {item.products?.name || "Unknown Product"}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.price_at_purchase.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(item.quantity * item.price_at_purchase).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Customer & Address Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{order.customer_email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p>{order.shipping_address_line1}</p>
              {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
              <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
              <p>{order.shipping_country}</p>
              {order.shipping_phone && <p className="text-sm text-muted-foreground">Phone: {order.shipping_phone}</p>}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium capitalize">{order.payment_type}</p>
              </div>
              {order.stripe_payment_intent_id && (
                <p className="text-sm text-muted-foreground">
                  Payment Intent: <span className="font-mono text-xs">{order.stripe_payment_intent_id}</span>
                </p>
              )}
              {order.stripe_charge_id && (
                <p className="text-sm text-muted-foreground">
                  Charge ID: <span className="font-mono text-xs">{order.stripe_charge_id}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tracking & Shipping Label */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping & Tracking</CardTitle>
          <CardDescription>Update tracking information for this order.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateOrderTracking.bind(null, order.id)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tracking-number">Tracking Number</Label>
                <Input
                  id="tracking-number"
                  name="trackingNumber"
                  defaultValue={order.tracking_number || ""}
                  placeholder="e.g., 1Z9999999999999999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping-label-url">Shipping Label URL</Label>
                <Input
                  id="shipping-label-url"
                  name="shippingLabelUrl"
                  defaultValue={order.shipping_label_url || ""}
                  placeholder="https://example.com/label.pdf"
                />
              </div>
            </div>
            <Button type="submit" className="mt-4">Save Tracking Info</Button>
          </form>
        </CardContent>
      </Card>

      {/* Refund Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
          <CardDescription>Manage refund requests for this order.</CardDescription>
        </CardHeader>
        <CardContent>
          {refunds.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((refund: OrderRefundRequest) => (
                  <TableRow key={refund.id}>
                    <TableCell>{format(new Date(refund.request_date), 'PPP')}</TableCell>
                    <TableCell className="max-w-xs truncate">{refund.reason || "N/A"}</TableCell>
                    <TableCell>
                      {refund.customer_attachment_url ? (
                        <a href={refund.customer_attachment_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a>
                      ) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={refund.status === 'approved' ? 'default' : refund.status === 'rejected' ? 'destructive' : 'outline'} className="capitalize">
                        {refund.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={async () => await updateRefundRequestStatus(refund.id, 'approved')}>Approve</DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => await updateRefundRequestStatus(refund.id, 'rejected')}>Reject</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                Create Manual Refund
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Process Manual Refund</DialogTitle>
                                <DialogDescription>
                                  This would typically integrate with your payment gateway (e.g., Stripe) to issue a refund.
                                </DialogDescription>
                              </DialogHeader>
                              <p className="text-sm text-muted-foreground">
                                (Integration with payment gateway is conceptual for this demo.)
                              </p>
                              <DialogFooter>
                                <Button variant="outline">Close</Button>
                                <Button disabled>Issue Refund</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No refund requests for this order.</p>
          )}
        </CardContent>
      </Card>

      {/* Order Notes Section */}
      <OrderNotesSection orderId={order.id} />

      {/* Print Actions (Conceptual) */}
      <Card>
        <CardHeader>
          <CardTitle>Print Actions</CardTitle>
          <CardDescription>Generate printable documents for this order.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" disabled>
            <FileText className="mr-2 h-4 w-4" /> Print Receipt
          </Button>
          <Button variant="outline" disabled>
            <FileText className="mr-2 h-4 w-4" /> Print Invoice
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}