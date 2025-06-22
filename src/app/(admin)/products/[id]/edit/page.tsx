"use client";

import { useEffect, useState, use } from 'react';
import PageHeader from '@/components/PageHeader';
import ProductForm from '../../components/ProductForm';
import { getProductById } from '@/lib/apiService';
import type { Product } from '@/types/ecommerce';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await getProductById(id);
        if (response.type === "OK" && response.data?.product) {
          setProduct(response.data.product);
        } else {
          toast({ title: "Error", description: response.message || "Failed to fetch product details.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "An error occurred while fetching product details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id, toast]);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-24 mb-4" />
        <Skeleton className="h-10 w-1/2 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-6" />
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 border rounded-lg">
              <Skeleton className="h-8 w-1/4 mb-4" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <BackButton defaultHref="/products" />
        <PageHeader title="Product Not Found" description="The product you are looking for does not exist or could not be loaded." />
      </>
    );
  }

  return (
    <>
      <BackButton defaultHref="/products" />
      <PageHeader
        title="Edit Product"
        description={`Editing product: ${product.name}`}
      />
      <ProductForm initialData={product} />
    </>
  );
}
