
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import type { OrderPlacedBatch, OrderPlacedBatchItem } from '@/types/ecommerce';
import { getOrderPlacedBatches, updateOrderPlacedBatch } from '@/lib/apiService'; // Mocked
import { DataTable } from '@/app/(admin)/products/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ColumnDef } from "@tanstack/react-table";
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Truck, CalendarDays, Edit3, Save } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';

interface BrandOrderPlacedTabProps {
  brandId: string;
  brandName: string;
}

interface EditableBatchState {
  [batchId: string]: {
    trackingId: string;
    deliveryStatus: OrderPlacedBatch['deliveryStatus'];
    isEditing: boolean;
  }
}

export default function BrandOrderPlacedTab({ brandId, brandName }: BrandOrderPlacedTabProps) {
  const [placedBatches, setPlacedBatches] = useState<OrderPlacedBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editableState, setEditableState] = useState<EditableBatchState>({});
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await getOrderPlacedBatches(brandId); // Mocked
      if (response.type === 'OK' && response.data?.batches) {
        setPlacedBatches(response.data.batches);
        // Initialize editable state
        const initialEditableState: EditableBatchState = {};
        response.data.batches.forEach(batch => {
          initialEditableState[batch.id] = {
            trackingId: batch.trackingId || "",
            deliveryStatus: batch.deliveryStatus || "Pending",
            isEditing: false,
          };
        });
        setEditableState(initialEditableState);
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch placed order batches.", variant: "destructive" });
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
  }, [brandId]);
  
  const handleEditToggle = (batchId: string) => {
    setEditableState(prev => ({
      ...prev,
      [batchId]: { ...prev[batchId], isEditing: !prev[batchId].isEditing }
    }));
  };

  const handleInputChange = (batchId: string, field: 'trackingId' | 'deliveryStatus', value: string) => {
    setEditableState(prev => ({
      ...prev,
      [batchId]: { ...prev[batchId], [field]: value }
    }));
  };

  const handleSaveChanges = async (batchId: string) => {
    const batchChanges = editableState[batchId];
    if (!batchChanges) return;

    // Client-side validation for tracking ID (manual entry after 24h is a business rule, not UI enforced here)
    // For demo, allow empty tracking ID. Real app might have different logic.

    setIsLoading(true); // Or a specific loading state for the batch
    try {
      const response = await updateOrderPlacedBatch(batchId, { // Mocked
        trackingId: batchChanges.trackingId,
        deliveryStatus: batchChanges.deliveryStatus,
      });
      if (response.type === 'OK' && response.data) {
        toast({ title: "Success", description: `Batch ${batchId} updated.` });
        // Update local state to reflect saved data
        setPlacedBatches(prev => prev.map(b => b.id === batchId ? {...b, ...response.data} : b));
        handleEditToggle(batchId); // Exit edit mode
      } else {
        toast({ title: "Error", description: response.message || "Failed to update batch.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred during update.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const itemColumns: ColumnDef<OrderPlacedBatchItem>[] = useMemo(() => [
    { accessorKey: "originalOrderId", header: "Original Order ID" },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "color", header: "Color", cell: ({row}) => row.original.color || "-" },
    { accessorKey: "size", header: "Size" },
    { accessorKey: "quantity", header: "Quantity" },
  ], []);


  if (isLoading && placedBatches.length === 0) {
    return <p>Loading placed orders...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Truck className="mr-2 h-6 w-6 text-primary" />
            Order Placed Batches for {brandName}
        </CardTitle>
        <CardDescription>
          View submitted order batches. Update Tracking ID (manually after 24 hours) and Delivery Status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {placedBatches.length === 0 && !isLoading && (
          <p className="text-muted-foreground text-center py-8">No order batches have been placed for this brand yet.</p>
        )}
        <Accordion type="multiple" className="w-full space-y-4">
          {placedBatches.map((batch) => (
            <AccordionItem value={batch.id} key={batch.id} className="border rounded-lg shadow-sm">
              <AccordionTrigger className="p-4 hover:bg-muted/50 rounded-t-lg">
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-muted-foreground"/>
                        <span className="font-semibold">Batch Submitted: {new Date(batch.submissionDate).toLocaleDateString()}</span>
                        <Badge variant={batch.deliveryStatus === 'Delivered' ? 'default' : batch.deliveryStatus === 'Pending' ? 'secondary' : 'outline'}>
                            {batch.deliveryStatus}
                        </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">Batch ID: {batch.id.substring(0,8)}...</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label htmlFor={`trackingId-${batch.id}`} className="text-sm font-medium text-muted-foreground">Tracking ID</label>
                      <Input
                        id={`trackingId-${batch.id}`}
                        value={editableState[batch.id]?.trackingId || ""}
                        onChange={(e) => handleInputChange(batch.id, 'trackingId', e.target.value)}
                        disabled={!editableState[batch.id]?.isEditing}
                        placeholder="Enter Tracking ID"
                        className="mt-1"
                      />
                      {!editableState[batch.id]?.isEditing && !editableState[batch.id]?.trackingId && 
                        <p className="text-xs text-muted-foreground mt-1">Enter after 24 hours of dispatch.</p>
                      }
                    </div>
                    <div>
                      <label htmlFor={`status-${batch.id}`} className="text-sm font-medium text-muted-foreground">Delivery Status</label>
                      <Select
                        value={editableState[batch.id]?.deliveryStatus || "Pending"}
                        onValueChange={(value) => handleInputChange(batch.id, 'deliveryStatus', value)}
                        disabled={!editableState[batch.id]?.isEditing}
                      >
                        <SelectTrigger id={`status-${batch.id}`} className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Not Delivered">Not Delivered</SelectItem>
                           <SelectItem value="Issue">Issue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      {editableState[batch.id]?.isEditing ? (
                        <Button onClick={() => handleSaveChanges(batch.id)} size="sm" disabled={isLoading}>
                          <Save className="mr-2 h-4 w-4" /> Save
                        </Button>
                      ) : (
                        <Button onClick={() => handleEditToggle(batch.id)} variant="outline" size="sm">
                          <Edit3 className="mr-2 h-4 w-4" /> Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-medium mt-4">Items in this Batch:</h4>
                  {batch.items && batch.items.length > 0 ? (
                     <DataTable columns={itemColumns} data={batch.items}
                        pagination={{ pageIndex: 0, pageSize: batch.items.length, pageCount: 1}}
                        setPagination={() => {}} // No-op pagination for nested table
                     />
                  ) : (
                    <p className="text-sm text-muted-foreground">No items found in this batch.</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

    