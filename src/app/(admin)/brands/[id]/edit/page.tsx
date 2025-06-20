"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brand } from '@/types/ecommerce';
import { getBrandById, updateBrand } from '@/lib/apiService';
import { useToast } from '@/hooks/use-toast';
import BrandForm from '../../components/BrandForm';
import BackButton from '@/components/BackButton';

export default function EditBrandPage() {
  const params = useParams();
  const id = params.id as string;
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBrand = async () => {
      setIsLoading(true);
      try {
        const response = await getBrandById(id);
        if (response.type === "OK" && response.data?.brand) {
          setBrand(response.data.brand);
        } else {
          toast({ title: "Error", description: response.message || "Failed to fetch brand.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "An error occurred while fetching brand.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchBrand();
    }
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader title="Edit Brand" description="Loading brand details..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <BackButton defaultHref="/brands" />
      <PageHeader title={`Editing brand: ${brand?.name || ''}`} description="Update brand details below." />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Edit Brand</CardTitle>
        </CardHeader>
        <CardContent>
          {brand && <BrandForm initialData={brand} />}
        </CardContent>
      </Card>
    </div>
  );
}
