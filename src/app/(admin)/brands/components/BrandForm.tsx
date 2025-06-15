
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Brand } from "@/types/ecommerce";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createBrand, updateBrand } from "@/lib/apiService";
import React, { useState } from "react";

const brandSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  logoUrl: z.string().url("Must be a valid URL for logo.").optional().or(z.literal("")),
  website: z.string().url("Must be a valid URL for website.").optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
});

type BrandFormValues = z.infer<typeof brandSchema>;

interface BrandFormProps {
  initialData?: Brand | null;
}

export default function BrandForm({ initialData }: BrandFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: initialData ? {
        ...initialData,
        logoUrl: initialData.logoUrl || "",
        website: initialData.website || "",
        isActive: initialData.isActive ?? true,
    } : {
      name: "",
      description: "",
      logoUrl: "",
      website: "",
      isActive: true,
    },
  });

  const onSubmit = async (values: BrandFormValues) => {
    setIsLoading(true);
    try {
      let response;
      if (initialData) {
        response = await updateBrand(initialData.id, values);
      } else {
        response = await createBrand(values as Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>);
      }

      if (response.type === "OK") {
        toast({ title: "Success", description: `Brand ${initialData ? 'updated' : 'created'} successfully.` });
        router.push("/brands");
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
              <FormLabel>Brand Name</FormLabel>
              <FormControl><Input placeholder="e.g., Awesome Brand" {...field} /></FormControl>
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
              <FormControl><Textarea placeholder="Brief description of the brand" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL (Optional)</FormLabel>
              <FormControl><Input type="url" placeholder="https://example.com/logo.png" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL (Optional)</FormLabel>
              <FormControl><Input type="url" placeholder="https://example.com" {...field} /></FormControl>
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
                <FormDescription>Is this brand currently active?</FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/brands')} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Brand')}</Button>
        </div>
      </form>
    </Form>
  );
}
