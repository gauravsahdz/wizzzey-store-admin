
"use client";

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import CategoryForm from '../../components/CategoryForm';
import { getCategoryById } from '@/lib/apiService';
import type { Category } from '@/types/ecommerce';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoading(true);
      try {
        const response = await getCategoryById(params.id);
        if (response.type === "OK" && response.data?.category) {
          setCategory(response.data.category);
        } else {
          toast({ title: "Error", description: response.message || "Failed to fetch category details.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "An error occurred while fetching category details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) {
      fetchCategory();
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
  
  if (!category) {
    return (
      <>
        <BackButton defaultHref="/categories" />
        <PageHeader title="Category Not Found" description="The category you are looking for does not exist or could not be loaded." />
      </>
    );
  }

  return (
    <>
      <BackButton defaultHref="/categories"/>
      <PageHeader
        title="Edit Category"
        description={`Updating category: ${category.name}`}
      />
      <CategoryForm initialData={category} />
    </>
  );
}
