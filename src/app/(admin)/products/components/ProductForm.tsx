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
import { X, Loader2, Plus, Trash2 } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(2, "Description is required."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  sku: z.string().min(1, "SKU is required."),
  categoryId: z.string().min(1, "Category is required."),
  files: z.any(), // handled by file input
  brandId: z.string().optional(),
  compareAtPrice: z.coerce.number().optional(),
  costPrice: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0, "Stock must be a non-negative integer.").optional().default(0),
  lowStockThreshold: z.coerce.number().optional(),
  availableSizes: z.array(z.string()).optional(),
  colors: z.array(z.object({ name: z.string(), code: z.string() })).optional(),
  weight: z.object({ value: z.coerce.number(), unit: z.enum(["g", "kg", "lb", "oz"]) }).optional(),
  dimensions: z.object({ length: z.coerce.number(), width: z.coerce.number(), height: z.coerce.number(), unit: z.enum(["cm", "m", "in"]) }).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "active", "archived", "out_of_stock"]).optional().default("draft"),
  isFeatured: z.boolean().optional().default(false),
  seo: z.object({ title: z.string().optional(), description: z.string().optional(), keywords: z.array(z.string()).optional() }).optional(),
  ratings: z.object({ average: z.coerce.number().optional(), count: z.coerce.number().optional() }).optional(),
  barcode: z.string().optional(),
  media: z.array(z.object({ url: z.string(), type: z.enum(["image", "video"]), alt: z.string().optional() })).optional(),
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

  // Remove images state, use files for uploads
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Dynamic fields
  const [sizes, setSizes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [colors, setColors] = useState<{ name: string; code: string }[]>([]);
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [media, setMedia] = useState<{ url: string; type: "image" | "video"; alt?: string }[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      ...initialData,
      price: initialData.price || 0,
      stock: initialData.stock || 0,
      status: initialData.status || 'draft',
      isFeatured: initialData.isFeatured || false,
      brandId: initialData.brandId || undefined,
      compareAtPrice: initialData.compareAtPrice,
      costPrice: initialData.costPrice,
      lowStockThreshold: initialData.lowStockThreshold,
      availableSizes: initialData.availableSizes || [],
      colors: initialData.colors || [],
      weight: initialData.weight,
      dimensions: initialData.dimensions,
      tags: initialData.tags || [],
      seo: initialData.seo,
      ratings: initialData.ratings,
      barcode: initialData.barcode,
      media: initialData.media || [],
    } : {
      name: "",
      description: "",
      price: 0,
      sku: "",
      categoryId: "",
      brandId: undefined,
      compareAtPrice: undefined,
      costPrice: undefined,
      stock: 0,
      lowStockThreshold: undefined,
      availableSizes: [],
      colors: [],
      weight: undefined,
      dimensions: undefined,
      tags: [],
      status: 'draft',
      isFeatured: false,
      seo: undefined,
      ratings: undefined,
      barcode: undefined,
      media: [],
    },
  });

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
          fetchCategories(1, 100),
          fetchBrands(1, 100)
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
  const handleRemoveNewImageFile = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Dynamic field handlers (same as before)
  const addSize = () => setSizes([...sizes, ""]);
  const updateSize = (i: number, value: string) => setSizes(sizes.map((s, idx) => (idx === i ? value : s)));
  const removeSize = (i: number) => setSizes(sizes.filter((_, idx) => idx !== i));

  const addTag = () => setTags([...tags, ""]);
  const updateTag = (i: number, value: string) => setTags(tags.map((t, idx) => (idx === i ? value : t)));
  const removeTag = (i: number) => setTags(tags.filter((_, idx) => idx !== i));

  const addColor = () => setColors([...colors, { name: "", code: "" }]);
  const updateColor = (i: number, key: "name" | "code", value: string) => setColors(colors.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));
  const removeColor = (i: number) => setColors(colors.filter((_, idx) => idx !== i));

  const addSeoKeyword = () => setSeoKeywords([...seoKeywords, ""]);
  const updateSeoKeyword = (i: number, value: string) => setSeoKeywords(seoKeywords.map((k, idx) => (idx === i ? value : k)));
  const removeSeoKeyword = (i: number) => setSeoKeywords(seoKeywords.filter((_, idx) => idx !== i));

  const onSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      // Required fields
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("price", String(values.price));
      formData.append("sku", values.sku);
      formData.append("categoryId", values.categoryId);
      // Files
      newImageFiles.forEach(file => formData.append("files", file));
      // Optional fields
      if (values.brandId) formData.append("brandId", values.brandId);
      if (values.compareAtPrice !== undefined) formData.append("compareAtPrice", String(values.compareAtPrice));
      if (values.costPrice !== undefined) formData.append("costPrice", String(values.costPrice));
      if (values.stock !== undefined) formData.append("stock", String(values.stock));
      if (values.lowStockThreshold !== undefined) formData.append("lowStockThreshold", String(values.lowStockThreshold));
      if (sizes.length > 0) sizes.forEach(size => formData.append("availableSizes", size));
      if (colors.length > 0) colors.forEach(color => formData.append("colors", JSON.stringify(color)));
      if (values.weight) formData.append("weight", JSON.stringify(values.weight));
      if (values.dimensions) formData.append("dimensions", JSON.stringify(values.dimensions));
      if (tags.length > 0) tags.forEach(tag => formData.append("tags", tag));
      if (values.status) formData.append("status", values.status);
      if (values.isFeatured !== undefined) formData.append("isFeatured", String(values.isFeatured));
      if (values.seo) formData.append("seo", JSON.stringify({ ...values.seo, keywords: seoKeywords }));
      if (values.ratings) formData.append("ratings", JSON.stringify(values.ratings));
      if (values.barcode) formData.append("barcode", values.barcode);
      if (media.length > 0) media.forEach(m => formData.append("media", JSON.stringify(m)));
      // API call
      let response;
      console.log("values", values);
      if (initialData) {
        console.log("initialData", initialData);
        response = await updateProduct(initialData.id, values);
      } else {
        console.log("creating product");
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
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl><Input placeholder="e.g., TSHIRT-RED-L" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
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
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    disabled={isUploading}
                  />
                </FormControl>
                <FormDescription>Select one or more images for the product (at least one required).</FormDescription>
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
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
                      value={field.value}
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
                render={({ field }) => (
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
          <CardHeader><CardTitle>Advanced Details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {/* Compare At Price, Cost Price, Low Stock Threshold */}
            <FormField control={form.control} name="compareAtPrice" render={({ field }) => (
              <FormItem>
                <FormLabel>Compare At Price</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="costPrice" render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (
              <FormItem>
                <FormLabel>Low Stock Threshold</FormLabel>
                <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {/* Sizes */}
            <div className="flex flex-col gap-2">
              <FormLabel>Available Sizes</FormLabel>
              {sizes.map((size, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input value={size} onChange={e => updateSize(i, e.target.value)} placeholder="Size" />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeSize(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addSize}><Plus className="h-4 w-4" /> Add Size</Button>
            </div>
            {/* Tags */}
            <div className="flex flex-col gap-2">
              <FormLabel>Tags</FormLabel>
              {tags.map((tag, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input value={tag} onChange={e => updateTag(i, e.target.value)} placeholder="Tag" />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeTag(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="h-4 w-4" /> Add Tag</Button>
            </div>
            {/* Colors */}
            <div className="flex flex-col gap-2">
              <FormLabel>Colors</FormLabel>
              {colors.map((color, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input value={color.name} onChange={e => updateColor(i, "name", e.target.value)} placeholder="Color Name" />
                  <Input value={color.code} onChange={e => updateColor(i, "code", e.target.value)} placeholder="#HEX or rgb()" />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeColor(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addColor}><Plus className="h-4 w-4" /> Add Color</Button>
            </div>
            {/* Weight */}
            <FormField control={form.control} name="weight.value" render={({ field }) => (
              <FormItem>
                <FormLabel>Weight</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="weight.unit" render={({ field }) => (
              <FormItem>
                <FormLabel>Weight Unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-2">
              <FormField control={form.control} name="dimensions.length" render={({ field }) => (
                <FormItem>
                  <FormLabel>Length</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dimensions.width" render={({ field }) => (
                <FormItem>
                  <FormLabel>Width</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dimensions.height" render={({ field }) => (
                <FormItem>
                  <FormLabel>Height</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dimensions.unit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dimensions Unit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                      <SelectItem value="in">in</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            {/* Barcode */}
            <FormField control={form.control} name="barcode" render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode</FormLabel>
                <FormControl><Input placeholder="Barcode" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {/* SEO */}
            <div className="flex flex-col gap-2">
              <FormLabel className="text-lg font-bold">SEO</FormLabel>
              <FormField control={form.control} name="seo.title" render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Title</FormLabel>
                  <FormControl><Input placeholder="SEO Title" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="seo.description" render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Description</FormLabel>
                  <FormControl><Textarea placeholder="SEO Description" {...field} rows={2} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex flex-col gap-2">
                <FormLabel>SEO Keywords</FormLabel>
                {seoKeywords.map((keyword, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input value={keyword} onChange={e => updateSeoKeyword(i, e.target.value)} placeholder="Keyword" />
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeSeoKeyword(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addSeoKeyword}><Plus className="h-4 w-4" /> Add Keyword</Button>
              </div>
            </div>
            {/* Ratings */}
            <FormField control={form.control} name="ratings.average" render={({ field }) => (
              <FormItem>
                <FormLabel>Average Rating</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ratings.count" render={({ field }) => (
              <FormItem>
                <FormLabel>Rating Count</FormLabel>
                <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
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

