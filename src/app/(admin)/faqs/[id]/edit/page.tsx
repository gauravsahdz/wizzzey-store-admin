"use client";

import { useEffect, useState, use } from 'react';
import PageHeader from '@/components/PageHeader';
import FaqForm from '../../components/FaqForm';
import { getFaqById } from '@/lib/apiService';
import type { FAQ } from '@/types/ecommerce';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';

export default function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFaq = async () => {
      setIsLoading(true);
      try {
        const response = await getFaqById(id);
        if (response.type === "OK" && response.data?.faq) {
          setFaq(response.data.faq);
        } else {
          toast({ title: "Error", description: response.message || "Failed to fetch FAQ details.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "An error occurred while fetching FAQ details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchFaq();
    }
  }, [id, toast]);

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
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!faq) {
    return (
      <>
        <BackButton defaultHref="/faqs" />
        <PageHeader title="FAQ Not Found" description="The FAQ you are looking for does not exist or could not be loaded." />
      </>
    );
  }

  return (
    <>
      <BackButton defaultHref="/faqs" />
      <PageHeader
        title="Edit FAQ"
        description={`Updating FAQ: "${faq.question.substring(0,50)}..."`}
      />
      <FaqForm initialData={faq} />
    </>
  );
}
