
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Inventory, Product } from "@/types/ecommerce";
import { useToast } from "@/hooks/use-toast";
import { createInventoryItem, updateInventoryItem, getProducts } from "@/lib/apiService";
import React, { useEffect, useState } from "react";

const inventorySchema = z.object({
  productId: z.string().min(1, "Product is required."),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative."),
  minQuantity: z.coerce.number().int().min(0, "Min quantity must be non-negative.").optional(),
  maxQuantity: z.coerce.number().int().min(0, "Max quantity must be non-negative.").optional(),
  location: z.string().optional(),
  status: z.enum(['InStock', 'LowStock', 'OutOfStock']),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

interface InventoryItemDialogProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  item?: Inventory | null;
}

export default function InventoryItemDialog({ isOpen, onClose, item }: InventoryItemDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      productId: "",
      quantity: 0,
      minQuantity: 0,
      maxQuantity: 0,
      location: "",
      status: "InStock",
    },
  });
  
  useEffect(() => {
    async function loadProducts() {
      try {
        // Adjust pagination as needed, or implement search/select component for products
        const response = await getProducts(1, 200); 
        if (response.type === "OK" && response.data?.products) {
          setProducts(response.data.products);
        } else {
          toast({ title: "Error", description: "Failed to load products for selection.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "An error occurred while fetching products.", variant: "destructive" });
      }
    }
    if (isOpen) {
        loadProducts();
    }
  }, [isOpen, toast]);

  useEffect(() => {
    if (item && isOpen) { // Ensure dialog is open when resetting
      form.reset({
        productId: item.productId,
        quantity: item.quantity,
        minQuantity: item.minQuantity || 0,
        maxQuantity: item.maxQuantity || 0,
        location: item.location || "",
        status: item.status,
      });
    } else if (!item && isOpen) { // For new item, reset to defaults when dialog opens
       form.reset({
        productId: "",
        quantity: 0,
        minQuantity: 0,
        maxQuantity: 0,
        location: "",
        status: "InStock",
      });
    }
  }, [item, form, isOpen]);


  const onSubmit = async (values: InventoryFormValues) => {
    setIsLoading(true);
    try {
      let response;
      if (item) {
        response = await updateInventoryItem(item.id, values);
      } else {
        // Ensure lastUpdated is not sent, as it's managed by backend or not in create payload
        const createPayload = { ...values } as Omit<Inventory, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated'>;
        response = await createInventoryItem(createPayload);
      }

      if (response.type === "OK") {
        toast({ title: "Success", description: `Inventory item ${item ? 'updated' : 'created'} successfully.` });
        onClose(true); // Pass true to indicate data refresh needed
      } else {
        toast({ title: "Error", description: response.message || "An error occurred.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Inventory Item" : "Add New Inventory Item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update details for this inventory item." : "Fill in the details for the new inventory item."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!item}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (ID: {p.id.substring(0,8)}...)</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {!!item && <FormDescription>Product cannot be changed once an inventory item is created.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="minQuantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Min Quantity (Optional)</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="maxQuantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Max Quantity (Optional)</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl><Input placeholder="e.g., Warehouse A, Shelf 3" {...field} value={field.value ?? ''} /></FormControl>
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
                    <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="InStock">In Stock</SelectItem>
                      <SelectItem value="LowStock">Low Stock</SelectItem>
                      <SelectItem value="OutOfStock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose()} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? (item ? 'Updating...' : 'Creating...') : (item ? 'Save Changes' : 'Create Item')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    