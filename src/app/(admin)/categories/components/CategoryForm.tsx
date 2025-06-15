
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Category } from "@/types/ecommerce";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createCategory, updateCategory, getCategories as fetchParentCategories } from "@/lib/apiService";
import React, { useEffect, useState } from "react";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  slug: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.coerce.number().int().optional().default(0),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: Category | null;
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData ? {
        ...initialData,
        parentId: initialData.parentId || null, // Ensure null if undefined
        imageUrl: initialData.imageUrl || "",
        isActive: initialData.isActive ?? true,
        displayOrder: initialData.displayOrder || 0,
    } : {
      name: "",
      description: "",
      parentId: null,
      imageUrl: "",
      slug: "",
      icon: "",
      isActive: true,
      displayOrder: 0,
    },
  });

  useEffect(() => {
    async function loadParentCategories() {
      try {
        const response = await fetchParentCategories(1, 100); // Fetch all potential parent categories
        if (response.type === "OK" && response.data?.categories) {
          // Filter out the current category if editing, to prevent self-parenting
          setParentCategories(
            initialData 
            ? response.data.categories.filter(cat => cat.id !== initialData.id) 
            : response.data.categories
          );
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load parent categories.", variant: "destructive" });
      }
    }
    loadParentCategories();
  }, [toast, initialData]);

  const onSubmit = async (values: CategoryFormValues) => {
    setIsLoading(true);
    // Ensure parentId is string or undefined, not null for API
    const apiValues = { ...values, parentId: values.parentId === null ? undefined : values.parentId };

    try {
      let response;
      if (initialData) {
        response = await updateCategory(initialData.id, apiValues);
      } else {
        response = await createCategory(apiValues as Omit<Category, 'id' | 'createdAt' | 'updatedAt'>);
      }

      if (response.type === "OK") {
        toast({ title: "Success", description: `Category ${initialData ? 'updated' : 'created'} successfully.` });
        router.push("/categories");
        router.refresh();
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl><Input placeholder="e.g., Electronics" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl><Textarea placeholder="Brief description of the category" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category (Optional)</FormLabel>
              <Select onValueChange={(value) => field.onChange(value === "null" ? null : value)} defaultValue={field.value || "null"}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a parent category" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="null">None</SelectItem>
                  {parentCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl><Input type="url" placeholder="https://example.com/image.png" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (Optional)</FormLabel>
              <FormControl><Input placeholder="auto-generated if empty" {...field} /></FormControl>
              <FormDescription>URL-friendly version of the name. Auto-generated if left blank.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>Is this category currently active and visible?</FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="displayOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order (Optional)</FormLabel>
              <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
              <FormDescription>Order in which category appears (lower numbers first).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/categories')} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Category')}</Button>
        </div>
      </form>
    </Form>
  );
}
