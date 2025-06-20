"use client";
import React, { useState, useEffect, useMemo } from 'react';
import type { BrandDailyOrderItem, SoftInventoryItem } from '@/types/ecommerce';
import { submitBrandOrdersToPlaced, getSoftInventoryItems } from '@/lib/apiService';
import { api } from '@/lib/api';
import { DataTable } from '@/app/(admin)/products/components/data-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown, PackageSearch, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BrandDailyOrdersTabProps {
  brandId: string;
  brandName: string;
}

// Helper function to check stock (mocked)


// Fetch today's orders for a brand
async function fetchTodayOrders(brandId: string) {
  const response = await api.get(`/orders/today?brandId=${brandId}`);
  return response.data;
}

export default function BrandDailyOrdersTab({ brandId, brandName }: BrandDailyOrdersTabProps) {
  const [dailyOrders, setDailyOrders] = useState<BrandDailyOrderItem[]>([]);
  const [softInventory, setSoftInventory] = useState<SoftInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersResponse, softInventoryResponse] = await Promise.all([
        fetchTodayOrders(brandId),
        getSoftInventoryItems(1, 500, { brandName: brandName })
      ]);

      if (ordersResponse.type === 'OK' && ordersResponse.data?.orders) {
        console.log('Log: order daily: ', ordersResponse.data.orders);
        setDailyOrders(ordersResponse.data.orders);
      } else {
        toast({ title: "Error", description: ordersResponse.message || "Failed to fetch daily orders.", variant: "destructive" });
      }

      if (softInventoryResponse.type === 'OK' && softInventoryResponse.data?.softInventoryItems) {
        setSoftInventory(softInventoryResponse.data.softInventoryItems);
      } else {
        // Non-critical error, as stock check can default to 'out of stock'
        console.warn("Could not fetch soft inventory:", softInventoryResponse.message);
        setSoftInventory([]);
      }

    } catch (error) {
      toast({ title: "Error", description: "An error occurred while fetching data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, today]);

  const columns: ColumnDef<BrandDailyOrderItem>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => {
        return (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
               console.log('Log: value: ', value);
            }}
            aria-label="Select all out-of-stock orders"
          />
        );
      },
    },
    { accessorKey: "id", header: "Order ID" },
    { accessorKey: "productName", header: "Product Name", cell: ({row}) => row.items.map(item => item.productName).join(', ') },
    { accessorKey: "quantity", header: "Quantity", cell: ({row}) => row.items.map(item => item.quantity).join(', ') },
    { accessorKey: "totalAmount", header: "Total Amount"},
    {
      accessorKey: "stockStatus",
      header: "Stock Status",
      cell: ({ row }) => {
        return <Badge variant="default">In Stock</Badge>;
      }
    },
  ], [softInventory]);


  const handleSubmitSelected = async () => {
   console.log('Log: rowSelection: ', rowSelection);
  };

  const selectedRowCount = Object.values(rowSelection).filter(Boolean).length;


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <PackageSearch className="mr-2 h-6 w-6 text-primary" />
            Daily Orders for {brandName} ({today})
        </CardTitle>
        <CardDescription>
          View orders received today. Select out-of-stock items to move them to 'Order Placed'.
          Stock status is determined by checking Soft Inventory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button onClick={handleSubmitSelected} disabled={isSubmitting || selectedRowCount === 0}>
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? "Submitting..." : `Submit Selected (${selectedRowCount})`}
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={dailyOrders}
          isLoading={isLoading}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          // Pagination not implemented for this mocked table for brevity
          pagination={{ pageIndex: 0, pageSize: dailyOrders.length || 10 }}
          setPagination={() => {}} // No-op for now
          filterColumn="productName"
          filterPlaceholder="Filter by Product Name..."
        />
      </CardContent>
    </Card>
  );
}

    