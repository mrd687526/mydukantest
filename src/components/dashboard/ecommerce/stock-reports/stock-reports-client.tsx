"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProductsForStockReport } from "@/app/actions/products";
import { Product } from "@/lib/types";
import { StockReportsDataTable } from "./stock-reports-data-table";

type StockStatusFilter = 'all' | 'low_stock' | 'out_of_stock' | 'most_stocked';

interface StockReportsClientProps {
  initialProducts: Product[];
}

export function StockReportsClient({ initialProducts }: StockReportsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<StockStatusFilter>('all');

  const fetchData = async (filter: StockStatusFilter) => {
    setLoading(true);
    const result = await getProductsForStockReport(filter);
    if (result.error) {
      toast.error("Failed to fetch stock reports", { description: result.error });
      setProducts([]);
    } else {
      setProducts(result.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial fetch is handled by server component, but if filters change, we refetch.
  }, []);

  const handleFilterChange = (filterType: StockStatusFilter) => {
    setActiveFilter(filterType);
    fetchData(filterType);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('all')}
        >
          All Products
        </Button>
        <Button
          variant={activeFilter === 'low_stock' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('low_stock')}
        >
          Low in Stock
        </Button>
        <Button
          variant={activeFilter === 'out_of_stock' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('out_of_stock')}
        >
          Out of Stock
        </Button>
        <Button
          variant={activeFilter === 'most_stocked' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('most_stocked')}
        >
          Most Stocked
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Stock Overview</CardTitle>
          <CardDescription>
            View and manage your product inventory based on stock levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              Loading products...
            </div>
          ) : (
            <StockReportsDataTable data={products} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}