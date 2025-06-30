import { ProductForm } from "@/components/dashboard/ecommerce/products/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create a new product</h1>
        <p className="text-muted-foreground">
          Fill out the form below to add a new product to your store.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}