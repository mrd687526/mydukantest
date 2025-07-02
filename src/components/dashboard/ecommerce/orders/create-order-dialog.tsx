"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { XCircle, PlusCircle, MinusCircle } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOrder } from "@/app/actions/orders";
import { createBrowserClient } from "@/integrations/supabase/client";
import { Product } from "@/lib/types";

const orderItemSchema = z.object({
  product_id: z.string().uuid("Invalid product ID."),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
});

const orderFormSchema = z.object({
  order_number: z.string().min(1, "Order number is required."),
  customer_name: z.string().min(1, "Customer name is required."),
  customer_email: z.string().email("Invalid email format."),
  total_amount: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0.01, "Total amount must be greater than 0.")
  ),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  payment_type: z.string().min(1, "Payment type is required."),
  items: z.array(orderItemSchema).min(1, "At least one product must be added to the order."),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface CreateOrderDialogProps {
  onClose: () => void;
}

export function CreateOrderDialog({ onClose }: CreateOrderDialogProps) {
  const supabase = createBrowserClient();
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{ product: Product; quantity: number }>
  >([]);
  const [selectedProductIdToAdd, setSelectedProductIdToAdd] = useState<string>("");

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      order_number: "",
      customer_name: "",
      customer_email: "",
      total_amount: 0.01,
      status: "pending",
      payment_type: "cash",
      items: [],
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products.");
      } else {
        setAvailableProducts(data || []);
      }
    };
    fetchProducts();
  }, [supabase]);

  useEffect(() => {
    const calculatedTotal = selectedProducts.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    form.setValue("total_amount", parseFloat(calculatedTotal.toFixed(2)));
    form.setValue(
      "items",
      selectedProducts.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }))
    );
  }, [selectedProducts, form]);

  const handleAddProduct = () => {
    const productToAdd = availableProducts.find(
      (p) => p.id === selectedProductIdToAdd
    );
    if (productToAdd) {
      setSelectedProducts((prev) => {
        const existingItem = prev.find(
          (item) => item.product.id === productToAdd.id
        );
        if (existingItem) {
          return prev.map((item) =>
            item.product.id === productToAdd.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { product: productToAdd, quantity: 1 }];
      });
      setSelectedProductIdToAdd(""); // Reset select
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setSelectedProducts((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
  };

  const onSubmit = async (data: OrderFormValues) => {
    const result = await createOrder(data);

    if (result.error) {
      toast.error("Failed to create order", {
        description: result.error,
      });
    } else {
      toast.success("Order created successfully!");
      form.reset();
      setSelectedProducts([]);
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Manually add a new order to your store.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="order_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., #1001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Selection Section */}
            <div className="space-y-2">
              <FormLabel>Order Items</FormLabel>
              <div className="flex gap-2">
                <Select
                  value={selectedProductIdToAdd}
                  onValueChange={setSelectedProductIdToAdd}
                >
                  <SelectTrigger className="flex-grow">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.length > 0 ? (
                      availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (${product.price.toFixed(2)})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        No products available.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={!selectedProductIdToAdd || availableProducts.length === 0}
                >
                  Add
                </Button>
              </div>
              {selectedProducts.length > 0 && (
                <div className="border rounded-md p-2 mt-2 space-y-2">
                  {selectedProducts.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {item.product.image_url && (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            width={32}
                            height={32}
                            className="rounded object-cover"
                          />
                        )}
                        <span>
                          {item.product.name} (${item.product.price.toFixed(2)})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.product.id, -1)}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.product.id, 1)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProduct(item.product.id)}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <FormField
                control={form.control}
                name="items"
                render={() => (
                  <FormItem>
                    <FormMessage /> {/* Display error if no items */}
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="total_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" readOnly {...field} />
                  </FormControl>
                  <FormDescription>Automatically calculated from selected items.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select order status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}