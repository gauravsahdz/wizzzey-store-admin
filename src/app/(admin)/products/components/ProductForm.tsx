
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product, Category, Brand } from "@/types/ecommerce";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createProduct, updateProduct, getCategories as fetchCategories, getBrands as fetchBrands, uploadFiles } from "@/lib/apiService";
import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  categoryId: z.string().min(1, "Category is required."),
  brandId: z.string().optional(),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0, "Stock must be a non-negative integer.").optional().default(0),
  inStock: z.boolean().optional().default(true),
  status: z.enum(['draft', 'active', 'archived', 'out_of_stock']).optional().default('draft'),
  isFeatured: z.boolean().optional().default(false),
  images: z.array(z.string().url("Each image must be a valid URL.")).optional().default([]),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product | null;
}

const NONE_BRAND_ID_VALUE = "_NONE_BRAND_ID_"; // Special value for "None" brand option

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(initialData?.images || []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);


  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
        ...initialData,
        price: initialData.price || 0,
        stock: initialData.stock || 0,
        inStock: initialData.inStock ?? true,
        status: initialData.status || 'draft',
        isFeatured: initialData.isFeatured || false,
        brandId: initialData.brandId || undefined, // Ensure undefined for no brand
        images: initialData.images || [],
    } : {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      brandId: undefined, // Ensure undefined for no brand
      sku: "",
      stock: 0,
      inStock: true,
      status: 'draft',
      isFeatured: false,
      images: [],
    },
  });
  
  useEffect(() => {
    if (initialData?.images) {
      setExistingImageUrls(initialData.images);
    }
  }, [initialData]);

  useEffect(() => {
    const newPreviews = newImageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newImageFiles]);


  useEffect(() => {
    async function loadRelatedData() {
      setIsLoading(true);
      try {
        const [catResponse, brandResponse] = await Promise.all([
          fetchCategories(1, 100), // Fetch more if needed
          fetchBrands(1,100)      // Fetch more if needed
        ]);
        if (catResponse.type === "OK" && catResponse.data?.categories) {
          setCategories(catResponse.data.categories);
        } else {
            toast({ title: "Error", description: `Failed to load categories: ${catResponse.message}`, variant: "destructive" });
        }
         if (brandResponse.type === "OK" && brandResponse.data?.brands) {
          setBrands(brandResponse.data.brands);
        } else {
            toast({ title: "Error", description: `Failed to load brands: ${brandResponse.message}`, variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load related product data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadRelatedData();
  }, [toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setNewImageFiles(Array.from(event.target.files));
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImageFile = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };


  const onSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    
    try {
      let response;
      const productPayload = { ...values }; // Start with form values

      if (initialData) { // Updating existing product
        setIsUploading(newImageFiles.length > 0);
        let uploadedNewUrls: string[] = [];
        if (newImageFiles.length > 0) {
          const uploadResponse = await uploadFiles(newImageFiles);
          if (uploadResponse.type === "OK" && uploadResponse.data?.urls) {
            uploadedNewUrls = uploadResponse.data.urls;
          } else {
            throw new Error(uploadResponse.message || "Failed to upload new images.");
          }
        }
        setIsUploading(false);
        
        productPayload.images = [...existingImageUrls, ...uploadedNewUrls];
        response = await updateProduct(initialData.id, productPayload);

      } else { // Creating new product
        // For new products, images are sent via FormData
        const formData = new FormData();
        Object.entries(productPayload).forEach(([key, value]) => {
            if (key === 'images') return; // Files handled separately
            if (value !== undefined && value !== null) {
                 if (Array.isArray(value)) {
                    value.forEach(item => formData.append(key, item));
                 } else if (typeof value === 'object' && value !== null) {
                    formData.append(key, JSON.stringify(value));
                 }
                 else {
                    formData.append(key, String(value));
                 }
            }
        });
        
        newImageFiles.forEach(file => {
          formData.append('files', file); // Backend expects 'files'
        });
        
        response = await createProduct(formData);
      }

      if (response.type === "OK") {
        toast({ title: "Success", description: `Product ${initialData ? 'updated' : 'created'} successfully.` });
        router.push("/products");
        router.refresh();
      } else {
        toast({ title: "Error", description: response.message || "An error occurred.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 shadow-lg">
            <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Awesome T-Shirt" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Detailed product description..." {...field} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                    <Input 
                        type="file" 
                        multiple 
                        onChange={handleFileChange} 
                        accept="image/*"
                        className="block w-full text-sm text-slate-500
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-primary/10 file:text-primary
                                   hover:file:bg-primary/20"
                        disabled={isUploading}
                    />
                </FormControl>
                <FormDescription>Select one or more images for the product (e.g., at least 5 recommended for good coverage).</FormDescription>
                
                {(existingImageUrls.length > 0 || imagePreviews.length > 0) && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {existingImageUrls.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group aspect-square">
                        <Image src={url} alt={`Existing image ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-75 group-hover:opacity-100"
                          onClick={() => handleRemoveExistingImage(index)}
                          disabled={isLoading || isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {imagePreviews.map((previewUrl, index) => (
                      <div key={`new-${index}`} className="relative group aspect-square">
                        <Image src={previewUrl} alt={`New image ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-75 group-hover:opacity-100"
                          onClick={() => handleRemoveNewImageFile(index)}
                          disabled={isLoading || isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                 {isUploading && (
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Uploading new images...</span>
                    </div>
                 )}
              </FormItem>
            </CardContent>
          </Card>

          <Card className="md:col-span-1 shadow-lg">
            <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                        onValueChange={field.onChange} 
                        value={field.value} // RHF provides string | undefined
                        disabled={isLoading || isUploading}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => ( // field.value is string | undefined
                  <FormItem>
                    <FormLabel>Brand (Optional)</FormLabel>
                    <Select
                      onValueChange={(selectedValue) => {
                        field.onChange(selectedValue === NONE_BRAND_ID_VALUE ? undefined : selectedValue);
                      }}
                      value={field.value === undefined ? NONE_BRAND_ID_VALUE : field.value}
                      disabled={isLoading || isUploading}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a brand" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value={NONE_BRAND_ID_VALUE}>None</SelectItem>
                        {brands.map(brand => <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
                    <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={isLoading || isUploading}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Featured Product</FormLabel>
                      <FormDescription>Display this product prominently.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading || isUploading} /></FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
            <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} disabled={isLoading || isUploading} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>SKU (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., TSHIRT-RED-L" {...field} disabled={isLoading || isUploading} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} disabled={isLoading || isUploading} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="inStock"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm col-span-1 md:col-span-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading || isUploading} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Product is In Stock</FormLabel>
                      <FormDescription>Uncheck if product is not available for purchase.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/products')} disabled={isLoading || isUploading}>Cancel</Button>
          <Button type="submit" disabled={isLoading || isUploading}>
            {isLoading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Product')}
            {(isLoading || isUploading) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}

