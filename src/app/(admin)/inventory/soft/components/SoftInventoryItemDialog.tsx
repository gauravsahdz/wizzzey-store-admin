
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SoftInventoryItem } from "@/types/ecommerce";
import { useToast } from "@/hooks/use-toast";
import { addSoftInventoryItem } from "@/lib/apiService"; // Mocked API
import React, { useEffect, useState } from "react";

const softInventorySchema = z.object({
  brandName: z.string().min(1, "Brand Name is required."),
  sku: z.string().min(1, "SKU is required."),
  size: z.string().min(1, "Size is required."),
  color: z.string().optional(),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative."),
});

type SoftInventoryFormValues = z.infer<typeof softInventorySchema>;

interface SoftInventoryItemDialogProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  itemData?: SoftInventoryItem | null; // For potential edit functionality
}

export default function SoftInventoryItemDialog({ isOpen, onClose, itemData }: SoftInventoryItemDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SoftInventoryFormValues>({
    resolver: zodResolver(softInventorySchema),
    defaultValues: {
      brandName: "",
      sku: "",
      size: "",
      color: "",
      quantity: 0,
    },
  });
  
  useEffect(() => {
    if (itemData && isOpen) {
      form.reset({
        brandName: itemData.brandName,
        sku: itemData.sku,
        size: itemData.size,
        color: itemData.color || "",
        quantity: itemData.quantity,
      });
    } else if (!itemData && isOpen) {
      form.reset({ // Reset to default for new item
        brandName: "",
        sku: "",
        size: "",
        color: "",
        quantity: 0,
      });
    }
  }, [itemData, form, isOpen]);


  const onSubmit = async (values: SoftInventoryFormValues) => {
    setIsLoading(true);
    try {
      let response;
      if (itemData) {
        // response = await updateSoftInventoryItem(itemData.id, values); // Requires API endpoint
        toast({ title: "Update Mock", description: `Called update for ${itemData.id}. Backend needed.`, variant: "default" });
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        response = { type: "OK" }; // Mock response
      } else {
        response = await addSoftInventoryItem(values); // Uses mocked API
      }

      if (response.type === "OK") {
        toast({ title: "Success", description: `Soft Inventory item ${itemData ? 'updated (mocked)' : 'added (mocked)'} successfully.` });
        onClose(true); 
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
          <DialogTitle>{itemData ? "Edit Soft Inventory Item" : "Add New Soft Inventory Item"}</DialogTitle>
          <DialogDescription>
            {itemData ? "Update details for this soft inventory item." : "Fill in the details for the new soft inventory item."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="brandName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl><Input placeholder="e.g., TechCorp" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl><Input placeholder="e.g., SPX-001-BLK-M" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Size</FormLabel>
                    <FormControl><Input placeholder="e.g., M, L, 10 inches" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Color (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Black, Red" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose()} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? (itemData ? 'Updating...' : 'Adding...') : (itemData ? 'Save Changes' : 'Add Item')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    