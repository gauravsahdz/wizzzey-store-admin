
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import BackButton from '@/components/BackButton';
import { Brand } from '@/types/ecommerce';
import { getBrandById } from '@/lib/apiService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BrandDailyOrdersTab from './components/BrandDailyOrdersTab';
import BrandOrderPlacedTab from './components/BrandOrderPlacedTab';

export default function BrandManagementPage() {
  const params = useParams();
  const brandId = params.id as string;
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!brandId) {
      toast({ title: "Error", description: "Brand ID is missing.", variant: "destructive" });
      router.push('/brands'); // Redirect if no ID
      return;
    }

    const fetchBrandDetails = async () => {
      setIsLoading(true);
      try {
        const response = await getBrandById(brandId);
        if (response.type === "OK" && response.data?.brand) {
          setBrand(response.data.brand);
        } else {
          toast({ title: "Error", description: response.message || "Failed to fetch brand details.", variant: "destructive" });
          setBrand(null);
        }
      } catch (error) {
        toast({ title: "Error", description: "An error occurred while fetching brand details.", variant: "destructive" });
        setBrand(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandDetails();
  }, [brandId, toast, router]);

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-8 w-20 mb-4" /> {/* Back button */}
        <Skeleton className="h-10 w-1/2 mb-2" /> {/* Title */}
        <Skeleton className="h-6 w-3/4 mb-6" /> {/* Description */}
        <Skeleton className="h-10 w-full mb-4" /> {/* Tabs List */}
        <Skeleton className="h-64 w-full" /> {/* Tab Content */}
      </>
    );
  }

  if (!brand) {
    return (
      <>
        <BackButton defaultHref="/brands" />
        <PageHeader
          title="Brand Not Found"
          description="The brand you are looking for could not be loaded."
        />
      </>
    );
  }

  return (
    <>
      <BackButton defaultHref="/brands" />
      <PageHeader
        title={`Manage Brand: ${brand.name}`}
        description="Oversee daily orders and placed orders for this brand."
      />
      <Tabs defaultValue="daily-orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="daily-orders">Daily Orders</TabsTrigger>
          <TabsTrigger value="order-placed">Order Placed</TabsTrigger>
        </TabsList>
        <TabsContent value="daily-orders">
          <BrandDailyOrdersTab brandId={brand.id} brandName={brand.name} />
        </TabsContent>
        <TabsContent value="order-placed">
          <BrandOrderPlacedTab brandId={brand.id} brandName={brand.name} />
        </TabsContent>
      </Tabs>
    </>
  );
}

    