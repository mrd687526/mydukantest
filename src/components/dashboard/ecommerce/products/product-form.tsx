"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Product } from "@/lib/types";
import { createProduct, updateProduct } from "@/app/actions/products";

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().optional().nullable(),
  price: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0.01, "Price must be greater than 0.")
  ),
  sku: z.string().optional().nullable(),
  inventory_quantity: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().min(0, "Inventory must be a non-negative integer.")
  ),
  image_url: z.string().url("Invalid URL format.").optional().nullable(),
  category: z.string().optional().nullable(),
  subcategory: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  variant: z.string().optional().nullable(),
  sale_price: z.preprocess(
    (val) => val && String(val).trim() !== '' ? parseFloat(String(val)) : null,
    z.number().min(0).optional().nullable()
  ),
  weight_kg: z.preprocess(
    (val) => val && String(val).trim() !== '' ? parseFloat(String(val)) : null,
    z.number().min(0).optional().nullable()
  ),
  tags: z.string().optional().nullable(),
  stock_status: z.enum(['in_stock', 'out_of_stock', 'on_backorder']).optional().nullable(),
  product_specification: z.string().optional().nullable(),
  product_details: z.string().optional().nullable(),
  is_trending: z.boolean().optional().nullable(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Product | null;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0.01,
      sku: initialData?.sku || "",
      inventory_quantity: initialData?.inventory_quantity || 0,
      image_url: initialData?.image_url || "",
      category: initialData?.category || "",
      subcategory: initialData?.subcategory || "",
      brand: initialData?.brand || "",
      label: initialData?.label || "",
      variant: initialData?.variant || "",
      sale_price: initialData?.sale_price || null,
      weight_kg: initialData?.weight_kg || null,
      tags: initialData?.tags?.join(', ') || "",
      stock_status: initialData?.stock_status || 'in_stock',
      product_specification: initialData?.product_specification || "",
      product_details: initialData?.product_details || "",
      is_trending: initialData?.is_trending || false,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      let result;
      if (initialData) {
        result = await updateProduct(initialData.id, data);
      } else {
        result = await createProduct(data);
      }

      if (result?.error) {
        toast.error(initialData ? "Failed to update product" : "Failed to create product", {
          description: result.error,
        });
      } else {
        toast.success(initialData ? "Product updated successfully!" : "Product created successfully!");
      }
    } catch (error) {
      // Redirects throw errors, so we catch them here.
      // The toast will be shown on the redirected page if session flashes are set up,
      // or we can just rely on the redirect as confirmation.
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Main Information</CardTitle>
                <CardDescription>Basic details about your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl><Input placeholder="e.g., 'Vintage T-Shirt'" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl><Input placeholder="e.g., 'Apparel'" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="subcategory" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <FormControl><Input placeholder="e.g., 'T-Shirts'" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl><Input placeholder="e.g., 'RetroWear'" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="label" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl><Input placeholder="e.g., 'New Arrival'" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="tags" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl><Input placeholder="e.g., 'cotton, summer, sale'" {...field} value={field.value ?? ''} /></FormControl>
                    <FormDescription>Separate tags with a comma.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>About Product</CardTitle>
                <CardDescription>Detailed descriptions and specifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Description</FormLabel>
                    <FormControl><Textarea placeholder="A brief description..." {...field} value={field.value ?? ''} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="product_specification" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Specification</FormLabel>
                    <FormControl><Textarea placeholder="e.g., 'Material: 100% Cotton'" {...field} value={field.value ?? ''} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="product_details" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Details</FormLabel>
                    <FormControl><Textarea placeholder="e.g., 'Made in USA'" {...field} value={field.value ?? ''} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
                <CardDescription>Provide a URL for the main product image.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField control={form.control} name="image_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl><Input placeholder="https://example.com/image.jpg" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="9.99" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="sale_price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="7.99" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="inventory_quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl><Input type="number" placeholder="100" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stock_status" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Stock Status</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value ?? 'in_stock'} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="in_stock" /></FormControl>
                          <FormLabel className="font-normal">In Stock</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="out_of_stock" /></FormControl>
                          <FormLabel className="font-normal">Out of Stock</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="on_backorder" /></FormControl>
                          <FormLabel className="font-normal">On Backorder</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Additional Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="is_trending" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Trending Product</FormLabel>
                      <FormDescription>Mark this product as trending.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/ecommerce/products')}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create Product")}
          </Button>
        </div>
      </form>
    </Form>
  );
}