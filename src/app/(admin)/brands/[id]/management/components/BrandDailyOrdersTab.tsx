
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import type { BrandDailyOrderItem, SoftInventoryItem } from '@/types/ecommerce';
import { getBrandDailyOrders, submitBrandOrdersToPlaced, getSoftInventoryItems } from '@/lib/apiService'; // Mocked
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
const checkSoftStock = (sku: string, size: string, color: string | undefined, softInventory: SoftInventoryItem[]): boolean => {
  const item = softInventory.find(
    si => si.sku === sku && si.size === size && (color ? si.color?.toLowerCase() === color.toLowerCase() : true)
  );
  return item ? item.quantity > 0 : false; // True if in stock, false if out of stock or not found
};


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
        getBrandDailyOrders(brandId, today), // Mocked
        getSoftInventoryItems(1, 500, { brandName: brandName }) // Fetch soft inventory for the brand, Mocked
      ]);

      if (ordersResponse.type === 'OK' && ordersResponse.data?.orders) {
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
        const isOutOfStockHeader = table.getFilteredRowModel().rows.some(row => !checkSoftStock(row.original.sku, row.original.size, row.original.color, softInventory));
        if (!isOutOfStockHeader && table.getFilteredRowModel().rows.length > 0) return null; // Don't show header checkbox if no items are out of stock

        return (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
                // Select only out-of-stock items
                const outOfStockRowIds = table.getFilteredRowModel().rows
                    .filter(row => !checkSoftStock(row.original.sku, row.original.size, row.original.color, softInventory))
                    .map(row => row.id);
                
                const newSelection: Record<string, boolean> = {};
                if (value) {
                    outOfStockRowIds.forEach(id => newSelection[id] = true);
                }
                table.setRowSelection(newSelection);
            }}
            aria-label="Select all out-of-stock orders"
            disabled={!isOutOfStockHeader}
          />
        );
      },
      cell: ({ row }) => {
        const isInStock = checkSoftStock(row.original.sku, row.original.size, row.original.color, softInventory);
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            disabled={isInStock} // Disable checkbox if stock is available
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: "id", header: "Order ID" },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "color", header: "Color", cell: ({row}) => row.original.color || "-" },
    { accessorKey: "size", header: "Size" },
    { accessorKey: "quantity", header: "Quantity" },
    {
      accessorKey: "stockStatus",
      header: "Stock Status",
      cell: ({ row }) => {
        const isInStock = checkSoftStock(row.original.sku, row.original.size, row.original.color, softInventory);
        return <Badge variant={isInStock ? "default" : "destructive"}>{isInStock ? "In Stock" : "Out of Stock"}</Badge>;
      }
    },
  ], [softInventory]);


  const handleSubmitSelected = async () => {
    setIsSubmitting(true);
    const selectedOrderIds = Object.keys(rowSelection).filter(id => rowSelection[id]);
    const ordersToSubmit = dailyOrders.filter(order => selectedOrderIds.includes(order.id));

    if (ordersToSubmit.length === 0) {
      toast({ title: "No Orders Selected", description: "Please select out-of-stock orders to submit.", variant: "default" });
      setIsSubmitting(false);
      return;
    }
    
    // Further filter to ensure only truly out-of-stock items are submitted (client-side re-check)
    const actualOutOfStockOrders = ordersToSubmit.filter(order => !checkSoftStock(order.sku, order.size, order.color, softInventory));
    
    if (actualOutOfStockOrders.length === 0) {
         toast({ title: "No Out-of-Stock Orders", description: "All selected orders appear to be in stock. No action taken.", variant: "default" });
         setIsSubmitting(false);
         setRowSelection({});
         return;
    }


    try {
      const response = await submitBrandOrdersToPlaced(brandId, actualOutOfStockOrders.map(o => o.id)); // Mocked API
      if (response.type === 'OK') {
        toast({ title: "Success", description: `${actualOutOfStockOrders.length} orders submitted to 'Order Placed'.` });
        setRowSelection({});
        fetchData(); // Refresh daily orders list
        // Potentially trigger refresh of OrderPlacedTab if it's a sibling component via context or prop drilling
      } else {
        toast({ title: "Error", description: response.message || "Failed to submit orders.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred during submission.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
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
          pagination={{ pageIndex: 0, pageSize: dailyOrders.length || 10, pageCount: 1}}
          setPagination={() => {}} // No-op for now
          filterColumn="sku"
          filterPlaceholder="Filter by SKU..."
        />
      </CardContent>
    </Card>
  );
}

    