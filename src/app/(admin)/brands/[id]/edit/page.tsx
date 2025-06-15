
"use client";

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import BrandForm from '../../components/BrandForm';
import { getBrandById } from '@/lib/apiService';
import type { Brand } from '@/types/ecommerce';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';

export default function EditBrandPage({ params }: { params: { id: string } }) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBrand = async () => {
      setIsLoading(true);
      try {
        const response = await getBrandById(params.id);
        if (response.type === "OK" && response.data?.brand) {
          setBrand(response.data.brand);
        } else {
           toast({ title: "Error", description: response.message || "Failed to fetch brand details.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "An error occurred while fetching brand details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) {
      fetchBrand();
    }
  }, [params.id, toast]);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-24 mb-4" />
        <Skeleton className="h-10 w-1/2 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-6" />
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
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

  if (!brand) {
     return (
      <>
        <BackButton defaultHref="/brands" />
        <PageHeader title="Brand Not Found" description="The brand you are looking for does not exist or could not be loaded." />
      </>
    );
  }

  return (
    <>
      <BackButton defaultHref="/brands" />
      <PageHeader
        title="Edit Brand"
        description={`Updating brand: ${brand.name}`}
      />
      <BrandForm initialData={brand} />
    </>
  );
}
