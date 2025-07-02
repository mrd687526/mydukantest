'use client';
import { createServerClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { RequestRefundDialog } from "@/components/storefront/request-refund-dialog"; // Import new dialog
import { useState } from "react"; // Import useState for dialog state

export default async function CustomerAccountPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/store/login");
  }

  // Determine the profile_id for the public storefront (same logic as /store/page.tsx)
  const { data: storeProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "store_admin")
    .limit(1)
    .maybeSingle();

  if (profileError || !storeProfile) {
    console.error("Error fetching store profile for customer account page:", profileError?.message);
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="text-muted-foreground">Welcome, {user.email}!</p>
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>Could not load store information. Please try again later.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const storeProfileId = storeProfile.id;

  // Fetch the customer's profile associated with this store's profile_id
  const { data: customerProfile, error: customerError } = await supabase
    .from("customers")
    .select("id, name, email")
    .eq("email", user.email!) // Assuming customer email matches auth email
    .eq("profile_id", storeProfileId) // Filter by store's profile_id
    .maybeSingle();

  if (customerError || !customerProfile) {
    console.error("Error fetching customer profile:", customerError);
    // Handle case where customer profile doesn't exist yet (e.g., new signup)
    // For now, we'll just show a message and no orders.
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="text-muted-foreground">Welcome, {user.email}!</p>
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>No orders found for your account yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Place an order to see it here!
            </p>
            <Button asChild className="w-full">
              <Link href="/store/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch orders associated with this customer_id and store's profile_id
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(`
      *,
      order_refund_requests (
        id,
        status
      )
    `)
    .eq("customer_id", customerProfile.id)
    .eq("profile_id", storeProfileId) // Filter by store's profile_id
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error fetching customer orders:", ordersError);
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="text-muted-foreground">Welcome, {customerProfile.name || customerProfile.email}!</p>
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>Failed to load your orders. Please try again later.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Mock saved addresses
  const [addresses, setAddresses] = useState([
    { id: "1", line1: "123 Main St", city: "Metropolis", country: "USA" },
  ]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: customerProfile.name || "",
    email: customerProfile.email || "",
  });
  function handleProfileChange(e) {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  }
  function handleProfileSave() {
    setEditingProfile(false);
    // TODO: Save to backend
  }
  function handleAddAddress() {
    setAddresses([...addresses, { id: Date.now().toString(), line1: "", city: "", country: "" }]);
  }
  function handleRemoveAddress(id) {
    setAddresses(addresses.filter(a => a.id !== id));
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Account</h1>
      <p className="text-muted-foreground">Welcome, {customerProfile.name || customerProfile.email}!</p>

      {/* Profile management */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-2">Profile</h2>
        {editingProfile ? (
          <div className="space-y-2">
            <input name="name" value={profileForm.name} onChange={handleProfileChange} className="border rounded px-2 py-1" />
            <input name="email" value={profileForm.email} onChange={handleProfileChange} className="border rounded px-2 py-1" />
            <button onClick={handleProfileSave} className="btn btn-primary">Save</button>
            <button onClick={() => setEditingProfile(false)} className="btn btn-secondary ml-2">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span>{profileForm.name} ({profileForm.email})</span>
            <button onClick={() => setEditingProfile(true)} className="btn btn-outline">Edit</button>
          </div>
        )}
      </section>

      {/* Saved addresses */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-2">Saved Addresses</h2>
        <ul className="space-y-2 mb-2">
          {addresses.map(addr => (
            <li key={addr.id} className="flex items-center gap-2">
              <span>{addr.line1}, {addr.city}, {addr.country}</span>
              <button onClick={() => handleRemoveAddress(addr.id)} className="btn btn-sm btn-danger">Remove</button>
            </li>
          ))}
        </ul>
        <button onClick={handleAddAddress} className="btn btn-sm btn-primary">Add Address</button>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>View your past orders and their statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const hasPendingRefund = order.order_refund_requests.some(req => req.status === 'pending');
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{format(new Date(order.created_at), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{order.status}</Badge>
                        {hasPendingRefund && <Badge variant="secondary" className="ml-2">Refund Pending</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View Details</Button>
                        {order.status === 'delivered' && !hasPendingRefund && (
                          <RequestRefundButton orderId={order.id} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No orders found for your account yet.
              <Button asChild variant="link" className="block mx-auto mt-2">
                <Link href="/store/products">Start Shopping</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Client component to handle the dialog state for "Request Refund" button
function RequestRefundButton({ orderId }: { orderId: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="ml-2">
        Request Refund
      </Button>
      {isDialogOpen && (
        <RequestRefundDialog orderId={orderId} onClose={() => setIsDialogOpen(false)} />
      )}
    </>
  );
}